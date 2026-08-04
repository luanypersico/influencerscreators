import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/hotmart")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleHotmartWebhook } = await import("@/lib/hotmart.server");
        return handleHotmartWebhook(request);
      },
      GET: async () =>
        new Response(JSON.stringify({ error: "method_not_allowed" }), {
          status: 405,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
    },
  },
});