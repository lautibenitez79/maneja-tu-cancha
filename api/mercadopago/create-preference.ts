import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const publicAppUrl =
  process.env.PUBLIC_APP_URL;

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
    if (!supabaseUrl) {
      return res.status(500).json({
        error: "Falta SUPABASE_URL.",
      });
    }

    if (!supabaseServiceRoleKey) {
      return res.status(500).json({
        error:
          "Falta SUPABASE_SERVICE_ROLE_KEY.",
      });
    }

    if (!publicAppUrl) {
      return res.status(500).json({
        error: "Falta PUBLIC_APP_URL.",
      });
    }

    const {
      club_id,
      reservation_id,
    } = req.body;

    if (
      typeof club_id !== "string" ||
      !club_id
    ) {
      return res.status(400).json({
        error: "Falta club_id.",
      });
    }

    if (
      typeof reservation_id !== "string" ||
      !reservation_id
    ) {
      return res.status(400).json({
        error: "Falta reservation_id.",
      });
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
      );

    /*
     * =====================================
     * 1. BUSCAR RESERVA
     * =====================================
     */

    const { data: reservation, error: reservationError } =
      await supabaseAdmin
        .from("reservations")
        .select(`
          id,
          club_id,
          resource_id,
          customer_name,
          customer_email,
          starts_at,
          ends_at,
          amount_paid,
          status,
          payment_status
        `)
        .eq("id", reservation_id)
        .eq("club_id", club_id)
        .single();

    if (reservationError) {
      console.error(
        "Reservation error:",
        reservationError,
      );

      return res.status(404).json({
        error:
          "No se encontró la reserva.",
      });
    }

    /*
     * =====================================
     * 2. BUSCAR CUENTA MERCADO PAGO
     * =====================================
     */

    const {
      data: marketplaceAccount,
      error: marketplaceError,
    } = await supabaseAdmin
      .from(
        "club_marketplace_accounts",
      )
      .select(`
        id,
        club_id,
        provider,
        mp_user_id,
        access_token,
        refresh_token,
        expires_at
      `)
      .eq("club_id", club_id)
      .eq("provider", "mercadopago")
      .single();

    if (
      marketplaceError ||
      !marketplaceAccount
    ) {
      console.error(
        "Marketplace account error:",
        marketplaceError,
      );

      return res.status(400).json({
        error:
          "El complejo todavía no tiene Mercado Pago conectado.",
      });
    }

    /*
     * =====================================
     * 3. VALIDAR TOKEN
     * =====================================
     */

    if (
      !marketplaceAccount.access_token
    ) {
      return res.status(400).json({
        error:
          "La cuenta de Mercado Pago no tiene un Access Token válido.",
      });
    }

    /*
     * =====================================
     * 4. VALIDAR ESTADO
     * =====================================
     */

    if (
      reservation.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        error:
          "La reserva está cancelada.",
      });
    }

    /*
     * =====================================
     * 5. OBTENER RECURSO
     * =====================================
     */

    const {
      data: resource,
      error: resourceError,
    } = await supabaseAdmin
      .from("resources")
      .select(`
        id,
        name,
        price,
        deposit_amount
      `)
      .eq("id", reservation.resource_id)
      .eq("club_id", club_id)
      .single();

    if (
      resourceError ||
      !resource
    ) {
      console.error(
        "Resource error:",
        resourceError,
      );

      return res.status(404).json({
        error:
          "No se encontró la cancha.",
      });
    }

    /*
     * =====================================
     * 6. VALIDAR SEÑA
     * =====================================
     */

    const depositAmount =
      Number(
        resource.deposit_amount,
      );

    if (
      !Number.isFinite(
        depositAmount,
      ) ||
      depositAmount <= 0
    ) {
      return res.status(400).json({
        error:
          "La cancha no tiene una seña configurada.",
      });
    }

    /*
     * =====================================
     * 7. CREAR PREFERENCE
     * =====================================
     */

    const preferenceBody = {
      items: [
        {
          id: resource.id,
          title: `Seña - ${resource.name}`,
          description:
            `Seña para reserva de ${resource.name}`,
          currency_id: "ARS",
          quantity: 1,
          unit_price: depositAmount,
        },
      ],

      payer: {
        email:
          reservation.customer_email,
        name:
          reservation.customer_name,
      },

      external_reference:
        reservation.id,

      back_urls: {
        success: `${publicAppUrl}/reserva/${reservation.id}?payment=success`,
        failure: `${publicAppUrl}/reserva/${reservation.id}?payment=failure`,
        pending: `${publicAppUrl}/reserva/${reservation.id}?payment=pending`,
      },

      auto_return: "approved",

      notification_url:
        `${publicAppUrl}/api/mercadopago/webhook`,
    };

    console.log(
      "Creando preference:",
      {
        clubId: club_id,
        reservationId:
          reservation.id,
        amount: depositAmount,
        mpUserId:
          marketplaceAccount.mp_user_id,
      },
    );

    const preferenceResponse =
      await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${marketplaceAccount.access_token}`,

            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            preferenceBody,
          ),
        },
      );

    const preferenceData =
      await preferenceResponse.json();

    /*
     * =====================================
     * 8. MERCADO PAGO ERROR
     * =====================================
     */

    if (
      !preferenceResponse.ok
    ) {
      console.error(
        "Mercado Pago Preference error:",
        {
          status:
            preferenceResponse.status,

          response:
            preferenceData,
        },
      );

      return res.status(500).json({
        error:
          "Mercado Pago rechazó la creación del pago.",
        details:
          preferenceData,
      });
    }

    /*
     * =====================================
     * 9. RESPUESTA
     * =====================================
     */

    console.log(
      "Preference creada:",
      preferenceData.id,
    );

    return res.status(200).json({
      id:
        preferenceData.id,

      init_point:
        preferenceData.init_point,

      sandbox_init_point:
        preferenceData.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "Create preference error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error creando el pago.",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}