import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import { createClient } from "@supabase/supabase-js";

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
    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    /*
     * =====================================
     * DATOS RECIBIDOS
     * =====================================
     */

    const {
      club_id,
      reservation_id,
    } = req.body ?? {};

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
        error:
          "Falta reservation_id.",
      });
    }

    console.log(
      "====================================",
    );

    console.log(
      "CREATE MERCADO PAGO PREFERENCE",
    );

    console.log({
      clubId: club_id,
      reservationId: reservation_id,
    });

    console.log(
      "====================================",
    );

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

    const {
      data: reservation,
      error: reservationError,
    } = await supabaseAdmin
      .from("reservations")
      .select(`
        id,
        club_id,
        resource_id,
        customer_name,
        customer_email,
        starts_at,
        ends_at,
        status,
        payment_status
      `)
      .eq("id", reservation_id)
      .eq("club_id", club_id)
      .single();

    if (
      reservationError ||
      !reservation
    ) {
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
     * 2. VALIDAR RESERVA
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
     * 3. BUSCAR CANCHA
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
      .eq(
        "id",
        reservation.resource_id,
      )
      .eq(
        "club_id",
        club_id,
      )
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
     * 4. OBTENER SEÑA
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
          "La cancha no tiene una seña válida configurada.",
      });
    }

    /*
     * =====================================
     * 5. BUSCAR CUENTA MP DEL CLUB
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
        expires_at
      `)
      .eq(
        "club_id",
        club_id,
      )
      .eq(
        "provider",
        "mercadopago",
      )
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
          "El club no tiene Mercado Pago conectado.",
      });
    }

    /*
     * =====================================
     * 6. VALIDAR ACCESS TOKEN
     * =====================================
     */

    if (
      !marketplaceAccount.access_token
    ) {
      return res.status(400).json({
        error:
          "La cuenta de Mercado Pago no tiene Access Token.",
      });
    }

    /*
     * =====================================
     * 7. CREAR PREFERENCE
     * =====================================
     */

    const preference = {
      items: [
        {
          id: resource.id,
          title: `Seña - ${resource.name}`,
          description: `Seña para reservar ${resource.name}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: Number(resource.deposit_amount),
        },
      ],

      external_reference: reservation.id,
    };

    console.log(
      "Preference:",
      {
        title:
          `Seña - ${resource.name}`,
        amount:
          depositAmount,
        mpUserId:
          marketplaceAccount.mp_user_id,
      },
    );

    /*
     * =====================================
     * 8. LLAMAR A MERCADO PAGO
     * =====================================
     */

    const response =
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
            preference,
          ),
        },
      );

    const data =
      await response.json();

    /*
     * =====================================
     * 9. ERROR MP
     * =====================================
     */

    if (!response.ok) {
      console.error(
        "Mercado Pago Preference error:",
        {
          status:
            response.status,
          data,
        },
      );

      return res.status(500).json({
        error:
          "Mercado Pago rechazó la creación de la preferencia.",
        details: data,
      });
    }

    /*
     * =====================================
     * 10. ÉXITO
     * =====================================
     */

    console.log(
      "Preference creada:",
      data.id,
    );

    console.log(
      "Init point:",
      data.init_point,
    );

    return res.status(200).json({
      success: true,

      preference_id:
        data.id,

      init_point:
        data.init_point,

      sandbox_init_point:
        data.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "Create preference error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error interno creando la preferencia.",

      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}