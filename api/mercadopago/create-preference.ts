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
    const {
      club_id,
      reservation_id,
    } = req.body ?? {};

    if (!club_id || !reservation_id) {
      return res.status(400).json({
        error:
          "club_id y reservation_id son obligatorios",
      });
    }

    /*
     * ---------------------------------------------------------
     * 1. BUSCAR CUENTA DE MERCADO PAGO DEL CLUB
     * ---------------------------------------------------------
     */

    const {
      data: account,
      error: accountError,
    } = await supabaseAdmin
      .from("club_marketplace_accounts")
      .select(
        `
        club_id,
        provider,
        mp_user_id,
        access_token,
        token_type,
        expires_at,
        active
        `,
      )
      .eq("club_id", club_id)
      .eq("provider", "mercadopago")
      .eq("active", true)
      .maybeSingle();

    if (accountError) {
      console.error(
        "Error buscando cuenta Mercado Pago:",
        accountError,
      );

      return res.status(500).json({
        error:
          "No se pudo obtener la cuenta de Mercado Pago",
      });
    }

    if (!account) {
      return res.status(400).json({
        error:
          "El club no tiene una cuenta de Mercado Pago conectada",
      });
    }

    if (!account.access_token) {
      return res.status(400).json({
        error:
          "La cuenta de Mercado Pago no tiene Access Token",
      });
    }

    /*
     * ---------------------------------------------------------
     * 2. BUSCAR RESERVA
     * ---------------------------------------------------------
     */

    const {
      data: reservation,
      error: reservationError,
    } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .eq("club_id", club_id)
      .maybeSingle();

    if (reservationError) {
      console.error(
        "Error buscando reserva:",
        reservationError,
      );

      return res.status(500).json({
        error:
          "No se pudo obtener la reserva",
      });
    }

    if (!reservation) {
      return res.status(404).json({
        error:
          "Reserva no encontrada",
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. VERIFICAR ESTADO DE LA RESERVA
     * ---------------------------------------------------------
     */

    if (
      reservation.status !==
      "pending_payment"
    ) {
      return res.status(400).json({
        error:
          "La reserva ya no está disponible para pago.",
      });
    }

    if (
      reservation.payment_status !==
      "pending"
    ) {
      return res.status(400).json({
        error:
          "La reserva no está pendiente de pago.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 4. IMPORTE
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
          "La reserva no tiene un importe válido para cobrar",
      });
    }

    /*
     * ---------------------------------------------------------
     * 5. URLS
     * ---------------------------------------------------------
     */

    const appUrl =
      process.env.PUBLIC_APP_URL?.replace(
        /\/+$/,
        "",
      );

    const apiUrl =
      process.env.PUBLIC_API_URL?.replace(
        /\/+$/,
        "",
      );

    if (!appUrl || !apiUrl) {
      return res.status(500).json({
        error:
          "Faltan configurar PUBLIC_APP_URL o PUBLIC_API_URL",
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. CREAR PREFERENCE
     * ---------------------------------------------------------
     */

    const preferenceBody = {
      items: [
        {
          id: reservation.id,
          title: "Seña - Cancha",
          description:
            "Seña para reservar la cancha",
          quantity: 1,
          currency_id: "ARS",
          unit_price: amount,
        },
      ],

      external_reference:
        reservation.id,

      payer: {
        email:
          reservation.customer_email,
      },

      back_urls: {
        success: `${appUrl}/pago/exito?reservation_id=${encodeURIComponent(
          reservation.id,
        )}`,
        failure: `${appUrl}/pago/error?reservation_id=${encodeURIComponent(
          reservation.id,
        )}`,
        pending: `${appUrl}/pago/pendiente?reservation_id=${encodeURIComponent(
          reservation.id,
        )}`,
      },

      auto_return: "approved",

      notification_url:
        `${apiUrl}/api/mercadopago/webhook`,
    };

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${account.access_token}`,
        },

        body: JSON.stringify(
          preferenceBody,
        ),
      },
    );

    const mpData =
      await mpResponse.json();

    console.log(
      "Mercado Pago response:",
      {
        status:
          mpResponse.status,

        ok:
          mpResponse.ok,

        id:
          mpData?.id,

        collector_id:
          mpData?.collector_id,

        marketplace_fee:
          mpData?.marketplace_fee,
      },
    );

    if (!mpResponse.ok) {
      console.error(
        "Mercado Pago preference error:",
        mpData,
      );

      return res.status(
        mpResponse.status,
      ).json({
        error:
          "Mercado Pago rechazó la creación de la Preference",

        details:
          mpData,
      });
    }

    /*
     * ---------------------------------------------------------
     * 7. RESPUESTA
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      preference_id:
        mpData.id,

      collector_id:
        mpData.collector_id ??
        account.mp_user_id,

      seller_mp_user_id:
        account.mp_user_id,

      marketplace_fee:
        mpData.marketplace_fee ?? 0,

      init_point:
        mpData.init_point,

      sandbox_init_point:
        mpData.sandbox_init_point,
    });

  } catch (error) {
    console.error(
      "Create preference error:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error interno creando el pago",
    });
  }
}