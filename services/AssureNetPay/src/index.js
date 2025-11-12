export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Root info
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          service: "AssureNet Pay",
          company: env.COMPANY_NAME,
          linked_registry: "Wynergy Licensing Registry"
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Checkout endpoint
    if (url.pathname === "/checkout" && request.method === "POST") {
      try {
        const { product, amount } = await request.json();
        const stripe = Stripe(env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "gbp",
                product_data: { name: product },
                unit_amount: parseInt(amount, 10)
              },
              quantity: 1
            }
          ],
          success_url: "https://wynergy.co.uk/payment-success",
          cancel_url: "https://wynergy.co.uk/payment-cancelled"
        });

        return new Response(JSON.stringify({ url: session.url }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  }
};
