// Browser-side counterpart to client-diagnostics.server.ts — never includes
// cookies, tokens, or other request-identifying data in the payload.

const ENDPOINT = "/api/public/diagnostics/client-error";

function correlationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function reportClientError(params: {
  error: unknown;
  source: "error_boundary" | "window_onerror" | "unhandledrejection" | "vite_preload_error";
}): void {
  if (typeof window === "undefined") return;

  const { error, source } = params;
  const errorName = error instanceof Error ? error.name : "Error";
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const body = JSON.stringify({
    pathname: window.location.pathname,
    hostname: window.location.hostname,
    source,
    errorName,
    errorMessage,
    ...(errorStack ? { errorStack } : {}),
    correlationId: correlationId(),
    clientTimestamp: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Best-effort only — never let diagnostic reporting itself break the app.
  }
}
