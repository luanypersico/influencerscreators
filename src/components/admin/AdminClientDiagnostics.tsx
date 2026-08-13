import { useCallback, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";

import { adminClientDiagnosticFn } from "@/lib/admin.functions";

type Diagnostic = {
  message: string;
  stack?: string;
  requestName?: string;
  status?: number;
};

const ADMIN_PATH = "/admin";

function errorDetails(error: unknown): Pick<Diagnostic, "message" | "stack"> {
  if (error instanceof Error)
    return { message: error.message, ...(error.stack ? { stack: error.stack } : {}) };
  return { message: String(error) };
}

/** Temporary production-only reporter for the admin incident. */
export function AdminClientDiagnostics() {
  const reportServer = useServerFn(adminClientDiagnosticFn);
  const reporting = useRef(false);

  const report = useCallback(
    (diagnostic: Diagnostic) => {
      if (!window.location.pathname.startsWith(ADMIN_PATH) || reporting.current) return;
      reporting.current = true;
      void reportServer({
        data: {
          pathname: window.location.pathname,
          message: diagnostic.message,
          stack: diagnostic.stack ?? "",
          requestName: diagnostic.requestName ?? "",
          status: diagnostic.status,
          correlationId: crypto.randomUUID(),
        },
      })
        .catch(() => undefined)
        .finally(() => {
          reporting.current = false;
        });
    },
    [reportServer],
  );

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      report({
        ...errorDetails(event.error ?? event.message),
        requestName: event.filename ? new URL(event.filename, window.location.origin).pathname : "",
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => report(errorDetails(event.reason));
    const onBoundary = (event: Event) => {
      const detail = (event as CustomEvent<Diagnostic>).detail;
      if (detail) report(detail);
    };
    const originalFetch = window.fetch.bind(window);

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("ADMIN_CLIENT_DIAGNOSTIC", onBoundary);
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (!response.ok) {
        const request = args[0] instanceof Request ? args[0] : new Request(args[0], args[1]);
        const path = new URL(request.url, window.location.origin).pathname;
        report({
          message: `Request failed with HTTP ${response.status}`,
          requestName: `${request.method} ${path}`,
          status: response.status,
        });
      }
      return response;
    };

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("ADMIN_CLIENT_DIAGNOSTIC", onBoundary);
      window.fetch = originalFetch;
    };
  }, [report]);

  return null;
}
