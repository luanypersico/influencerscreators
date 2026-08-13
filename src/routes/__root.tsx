import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { reportClientError } from "../lib/client-diagnostics";
import {
  extractErrorMessage,
  isChunkLoadErrorMessage,
  shouldReloadForChunkError,
} from "../lib/chunk-reload-guard";

const CHUNK_RELOAD_STORAGE_KEY = "arsenal:chunk-reload-attempted";

/**
 * Runs as the first thing in <head>, before any modulepreload link or module
 * script is even parsed — a stale chunk after a redeploy can fail during that
 * very first load, before React (and useChunkReloadGuard below) exists to
 * catch it. Plain ES5, no imports: nothing else has loaded yet. Shares the
 * sessionStorage key with useChunkReloadGuard so the two never double-reload.
 */
const EARLY_CHUNK_GUARD_SCRIPT = `(function () {
  var KEY = ${JSON.stringify(CHUNK_RELOAD_STORAGE_KEY)};
  var CHUNK_ERR = /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i;
  function report(source, message, stack) {
    try {
      var body = JSON.stringify({
        pathname: location.pathname,
        hostname: location.hostname,
        source: source,
        errorName: "EarlyBootError",
        errorMessage: String(message || "").slice(0, 2000),
        errorStack: stack ? String(stack).slice(0, 4000) : undefined,
        correlationId: Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
        clientTimestamp: new Date().toISOString()
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/public/diagnostics/client-error", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/public/diagnostics/client-error", { method: "POST", body: body, headers: { "content-type": "application/json" }, keepalive: true }).catch(function () {});
      }
    } catch (e) {}
  }
  function reloadOnce() {
    try {
      if (sessionStorage.getItem(KEY) === "1") return false;
      sessionStorage.setItem(KEY, "1");
    } catch (e) {}
    location.reload();
    return true;
  }
  window.addEventListener("vite:preloadError", function (event) {
    var payload = event && event.payload;
    report("vite_preload_error", payload && payload.message ? payload.message : "vite:preloadError", payload && payload.stack);
    event.preventDefault();
    reloadOnce();
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event && event.reason;
    var message = reason instanceof Error ? reason.message : String(reason || "");
    if (!CHUNK_ERR.test(message)) return;
    report("unhandledrejection", message, reason instanceof Error ? reason.stack : undefined);
    event.preventDefault();
    reloadOnce();
  });
})();`;

/** Post-hydration counterpart to the early inline script above — covers chunk failures during later client-side navigation, once React is running. A second failure right after a reload means the deploy is actually broken, so it falls through to the ErrorBoundary instead of looping. */
function useChunkReloadGuard() {
  useEffect(() => {
    function reloadOnce(source: "vite_preload_error" | "unhandledrejection", error: unknown) {
      const alreadyAttempted = sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) === "1";
      if (!shouldReloadForChunkError(alreadyAttempted)) return;
      reportClientError({ error, source });
      sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, "1");
      window.location.reload();
    }

    function handlePreloadError(event: Event) {
      event.preventDefault();
      reloadOnce("vite_preload_error", (event as CustomEvent).detail ?? event);
    }

    function handleRejection(event: PromiseRejectionEvent) {
      if (!isChunkLoadErrorMessage(extractErrorMessage(event.reason))) return;
      event.preventDefault();
      reloadOnce("unhandledrejection", event.reason);
    }

    window.addEventListener("vite:preloadError", handlePreloadError);
    window.addEventListener("unhandledrejection", handleRejection);

    // A clean mount that survives a few seconds means the reload (if any) worked —
    // clear the guard so a later, unrelated deploy can still trigger one reload.
    const clearGuardTimer = window.setTimeout(() => {
      sessionStorage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
    }, 10_000);

    return () => {
      window.removeEventListener("vite:preloadError", handlePreloadError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.clearTimeout(clearGuardTimer);
    };
  }, []);
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    reportClientError({ error, source: "error_boundary" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Essa página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Tente atualizar a página ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_TITLE = "A Casa — influencers virtuais exclusivas";
const SITE_DESCRIPTION =
  "Encontre a influencer virtual exclusiva que vai representar sua próxima marca: identidade, personalidade, rotina e universo visual próprios.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      // Demonstrative build — remove this line only in the launch round,
      // together with the Disallow rule in public/robots.txt.
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* eslint-disable-next-line react/no-danger -- inert diagnostic snippet, must run before any modulepreload/module script; see EARLY_CHUNK_GUARD_SCRIPT */}
        <script dangerouslySetInnerHTML={{ __html: EARLY_CHUNK_GUARD_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useChunkReloadGuard();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
