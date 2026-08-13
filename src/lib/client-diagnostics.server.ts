// Temporary production diagnostic: captures client-side runtime errors (React
// error boundary, window.onerror, unhandledrejection, vite:preloadError) so a
// real stack trace reaches Cloudflare's logs even without browser access.
// Never accepts or logs cookies, tokens, or other request-identifying data —
// only the fixed fields below, each length-capped.

const MAX_STRING = 4_000;
const ALLOWED_SOURCES = new Set([
  "error_boundary",
  "window_onerror",
  "unhandledrejection",
  "vite_preload_error",
]);

export type ClientErrorReport = {
  pathname: string;
  hostname: string;
  source: string;
  errorName: string;
  errorMessage: string;
  errorStack?: string;
  correlationId: string;
  clientTimestamp: string;
  buildSha?: string;
};

function truncate(value: unknown, max = MAX_STRING): string {
  const str = typeof value === "string" ? value : String(value ?? "");
  return str.slice(0, max);
}

/** Narrows an arbitrary JSON body down to the exact fields we log — nothing else ever passes through. */
export function sanitizeClientErrorReport(body: unknown): ClientErrorReport | null {
  if (body == null || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;

  const source = typeof raw["source"] === "string" && ALLOWED_SOURCES.has(raw["source"])
    ? raw["source"]
    : "unknown";

  const errorMessage = truncate(raw["errorMessage"], 2_000);
  if (!errorMessage) return null;

  return {
    pathname: truncate(raw["pathname"], 300) || "/",
    hostname: truncate(raw["hostname"], 200) || "unknown-host",
    source,
    errorName: truncate(raw["errorName"], 200) || "Error",
    errorMessage,
    ...(typeof raw["errorStack"] === "string" && raw["errorStack"]
      ? { errorStack: truncate(raw["errorStack"], MAX_STRING) }
      : {}),
    correlationId: truncate(raw["correlationId"], 100) || "no-correlation-id",
    clientTimestamp: truncate(raw["clientTimestamp"], 60) || new Date().toISOString(),
    ...(typeof raw["buildSha"] === "string" && raw["buildSha"]
      ? { buildSha: truncate(raw["buildSha"], 60) }
      : {}),
  };
}

export function logClientErrorReport(report: ClientErrorReport): void {
  console.error(`[client-diagnostics] ${report.source} at ${report.pathname} (${report.hostname})`, {
    correlationId: report.correlationId,
    clientTimestamp: report.clientTimestamp,
    buildSha: report.buildSha,
    errorName: report.errorName,
    errorMessage: report.errorMessage,
    errorStack: report.errorStack,
  });
}
