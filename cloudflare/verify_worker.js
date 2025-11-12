export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.split("/").filter(Boolean);

    // GET /verify/<key> – Verify and log to D1
    if (path[0] === "verify" && path[1]) {
      const key = path[1];
      const timestamp = new Date().toISOString();

      try {
        const data = await env.WYNERGY_REGISTRY_AUDIT.get(key);
        if (!data) {
          await env.WYNERGY_AUDIT_HISTORY
            .prepare("INSERT INTO audit_log (timestamp, key_name, status, message) VALUES (?, ?, ?, ?)")
            .bind(timestamp, key, "not_found", "No matching record")
            .run();

          return new Response(JSON.stringify({ ok: false, message: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Record verification
        await env.WYNERGY_AUDIT_HISTORY
          .prepare("INSERT INTO audit_log (timestamp, key_name, status, message) VALUES (?, ?, ?, ?)")
          .bind(timestamp, key, "verified", "Integrity check successful")
          .run();

        return new Response(
          JSON.stringify({
            ok: true,
            key,
            verified: true,
            data: JSON.parse(data),
            logged: timestamp,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        await env.WYNERGY_AUDIT_HISTORY
          .prepare("INSERT INTO audit_log (timestamp, key_name, status, message) VALUES (?, ?, ? ,?)")
          .bind(timestamp, key, "error", err.message)
          .run();

        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Default route
    return new Response(
      JSON.stringify({
        service: "Wynergy Verification & Audit API",
        usage: "/verify/<key>",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
