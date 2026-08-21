import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
    const { reservation_id } = req.body ?? {};

    if (!reservation_id) {
      return res.status(400).json({
        error: "reservation_id es obligatorio",
      });
    }

    console.log(
      "=== TEST RESERVATION DIRECT ===",
    );

    console.log(
      "reservation_id:",
      reservation_id,
    );

    /*
     * ---------------------------------------------------------
     * 1. Buscar reserva
     * ---------------------------------------------------------
     */

    const {
      data: reservation,
      error: reservationError,
    } = await supabaseAdmin
      .from("reservations")
      .select(
        `
        id,
        club_id,
        resource_id,
        customer_name,
        customer_email,
        total_amount,
        deposit_amount,
        amount_paid,
        payment_status,
        status
      `,
      )
      .eq("id", reservation_id)
      .maybeSingle();

    if (reservationError) {
      console.error(
        "Error buscando reserva:",
        reservationError,
      );

      return res.status(500).json({
        error: "Error buscando reserva",
        details: reservationError,
      });
    }

    if (!reservation) {
      return res.status(404).json({
        error: "Reserva no encontrada",
      });
    }

    console.log("Reserva:", {
      id: reservation.id,
      club_id: reservation.club_id,
      resource_id: reservation.resource_id,
      total_amount: reservation.total_amount,
      deposit_amount: reservation.deposit_amount,
      amount_paid: reservation.amount_paid,
      payment_status: reservation.payment_status,
      status: reservation.status,
    });

    /*
     * ---------------------------------------------------------
     * 2. Determinar importe
     * ---------------------------------------------------------
     */

    const amount = Number(
      reservation.deposit_amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        error:
          "La reserva no tiene un deposit_amount válido",
        deposit_amount:
          reservation.deposit_amount,
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. TOKEN DEL SELLER QUE YA FUNCIONÓ
     * ---------------------------------------------------------
     *
     * IMPORTANTE:
     *
     * Este token NO es el OAuth del club.
     *
     * Lo utilizamos únicamente para aislar el problema.
     *
     * Es el mismo token que utilizamos en:
     *
     * /api/mercadopago/test-direct-seller
     *
     * cuando conseguimos el pago exitoso.
     */

    const accessToken =
      process.env.MERCADOPAGO_TEST_SELLER_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error:
          "Falta MERCADOPAGO_TEST_SELLER_ACCESS_TOKEN",
      });
    }

    /*
     * ---------------------------------------------------------
     * 4. Preference
     * ---------------------------------------------------------
     */

    const preference = {
      items: [
        {
          id: reservation.id,

          title: "Seña - Reserva de cancha",

          description:
            `Seña para reservar la cancha. Reserva ${reservation.id}`,

          quantity: 1,

          currency_id: "ARS",

          unit_price: amount,
        },
      ],

      /*
       * ESTA VEZ utilizamos exactamente
       * el ID de la reserva.
       */
      external_reference:
        reservation.id,

      /*
       * Mantenemos URLs HTTPS reales.
       */

      back_urls: {
        success:
          "https://maneja-tu-cancha.vercel.app/pago/exito",

        failure:
          "https://maneja-tu-cancha.vercel.app/pago/error",

        pending:
          "https://maneja-tu-cancha.vercel.app/pago/pendiente",
      },

      auto_return: "approved",
    };

    console.log(
      "Preference:",
      preference,
    );

    /*
     * ---------------------------------------------------------
     * 5. Crear Preference
     * ---------------------------------------------------------
     */

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${accessToken}`,
        },

        body: JSON.stringify(preference),
      },
    );

    const mpData =
      await mpResponse.json();

    console.log(
      "Mercado Pago:",
      {
        status: mpResponse.status,
        ok: mpResponse.ok,
        id: mpData.id,
        collector_id:
          mpData.collector_id,
        marketplace:
          mpData.marketplace,
      },
    );

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        success: false,

        mercado_pago: mpData,
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. Respuesta
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      reservation: {
        id: reservation.id,

        total_amount:
          reservation.total_amount,

        deposit_amount:
          reservation.deposit_amount,

        customer_email:
          reservation.customer_email,
      },

      preference_id:
        mpData.id,

      collector_id:
        mpData.collector_id,

      marketplace:
        mpData.marketplace,

      external_reference:
        mpData.external_reference,

      init_point:
        mpData.init_point,

      sandbox_init_point:
        mpData.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "Test reservation direct error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error interno probando reserva",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}