import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const accessToken =
      process.env.MERCADOPAGO_TEST_SELLER_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error:
          "Falta MERCADOPAGO_TEST_SELLER_ACCESS_TOKEN",
      });
    }

    const preference = {
      items: [
        {
          id: "test-direct-seller",
          title: "Prueba Seller Directo",
          description:
            "Prueba Checkout Pro Seller Test User",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 100,
        },
      ],

      external_reference:
        "TEST-DIRECT-" + Date.now(),
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(preference),
      },
    );

    const data = await response.json();

    console.log("=== DIRECT SELLER TEST ===");

    console.log({
      status: response.status,
      ok: response.ok,
      id: data.id,
      collector_id: data.collector_id,
      client_id: data.client_id,
      marketplace: data.marketplace,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        mercado_pago: data,
      });
    }

    return res.status(200).json({
      success: true,
      preference_id: data.id,
      collector_id: data.collector_id,
      client_id: data.client_id,
      marketplace: data.marketplace,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      external_reference: data.external_reference,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno",
    });
  }
}