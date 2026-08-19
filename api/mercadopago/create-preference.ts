import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

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
    const {
      reservationId,
      title,
      amount,
      customerEmail,
    } = req.body;

    if (!reservationId) {
      return res.status(400).json({
        error: "Falta reservationId.",
      });
    }

    if (!title) {
      return res.status(400).json({
        error: "Falta el título del pago.",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        error: "El monto debe ser mayor a 0.",
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        error: "Falta el email del cliente.",
      });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: reservationId,
            title,
            quantity: 1,
            unit_price: Number(amount),
            currency_id: "ARS",
          },
        ],

        payer: {
          email: customerEmail,
        },

        external_reference: reservationId,

        back_urls: {
          success: `${process.env.PUBLIC_APP_URL}/pago/exitoso`,
          failure: `${process.env.PUBLIC_APP_URL}/pago/fallido`,
          pending: `${process.env.PUBLIC_APP_URL}/pago/pendiente`,
        },

        auto_return: "approved",

        notification_url:
          `${process.env.PUBLIC_API_URL}/api/mercadopago/webhook`,
      },
    });

    return res.status(200).json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);

    return res.status(500).json({
      error: "No se pudo crear la preferencia de Mercado Pago.",
    });
  }
}