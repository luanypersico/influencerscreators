import { createFileRoute } from "@tanstack/react-router";

const MAX_BODY_BYTES = 20_000;

export const Route = createFileRoute("/api/public/diagnostics/client-error")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { sanitizeClientErrorReport, logClientErrorReport } = await import(
          "@/lib/client-diagnostics.server"
        );

        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength > MAX_BODY_BYTES) {
          return new Response(null, { status: 413 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(null, { status: 400 });
        }

        const report = sanitizeClientErrorReport(body);
        if (!report) return new Response(null, { status: 400 });

        logClientErrorReport(report);
        return new Response(null, { status: 204 });
      },
      GET: async () =>
        new Response(JSON.stringify({ error: "method_not_allowed" }), {
          status: 405,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
    },
  },
});
