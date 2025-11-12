export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/verify/latest_registry") {
      try {
        const raw = await env.WYNERGY_REGISTRY.get("latest_registry");
        if (!raw) {
          return new Response("No registry found", { status: 404 });
        }

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }

        return new Response(JSON.stringify(parsed, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(`Internal error: ${err.message}`, { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};
