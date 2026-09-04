import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  try {
    const accessToken =
      process.env.MP_TEST_SELLER_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error:
          "Falta MP_TEST_SELLER_ACCESS_TOKEN.",
      });
    }

    const preference = {
      items: [
        {
          id: "test-cancha-3",
          title: "Prueba - Seña Cancha 3",
          description:
            "Prueba de pago Mercado Pago - Maneja Tu Cancha",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 14000,
        },
      ],

      external_reference:
        "TEST-MP-MANEJA-TU-CANCHA",

      back_urls: {
        success:
          "https://www.manejatucancha.com.ar/configuracion?mp_test=success",

        failure:
          "https://www.manejatucancha.com.ar/configuracion?mp_test=failure",

        pending:
          "https://www.manejatucancha.com.ar/configuracion?mp_test=pending",
      },

      auto_return: "approved",
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${accessToken}`,
        },

        body: JSON.stringify(
          preference,
        ),
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "Mercado Pago test preference error:",
        data,
      );

      return res.status(
        response.status,
      ).json({
        error:
          "Mercado Pago rechazó la Preference.",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,

      preference_id:
        data.id,

      collector_id:
        data.collector_id,

      init_point:
        data.init_point,

      sandbox_init_point:
        data.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "Test seller preference error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error creando Preference de prueba.",
    });
  }
}