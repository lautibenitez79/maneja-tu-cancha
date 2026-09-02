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
    const { club_id, reservation_id, gym_monthly_fee_id } = req.body ?? {};

    /*
     * ---------------------------------------------------------
     * 1. VALIDAR TIPO DE OPERACIÓN
     * ---------------------------------------------------------
     *
     * Debe llegar exactamente uno:
     *
     * - reservation_id       → reserva normal
     * - gym_monthly_fee_id   → cuota mensual de gimnasio
     */

    const hasReservation = Boolean(reservation_id);
    const hasGymFee = Boolean(gym_monthly_fee_id);

    if (!club_id) {
      return res.status(400).json({
        error: "club_id es obligatorio",
      });
    }

    if (hasReservation === hasGymFee) {
      return res.status(400).json({
        error:
          "Debe enviarse exactamente uno de reservation_id o gym_monthly_fee_id",
      });
    }

    /*
     * ---------------------------------------------------------
     * 2. BUSCAR CUENTA DE MERCADO PAGO DEL CLUB
     * ---------------------------------------------------------
     */

    const { data: account, error: accountError } = await supabaseAdmin
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
        error: "No se pudo obtener la cuenta de Mercado Pago",
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
     * 3. VARIABLES GENERALES
     * ---------------------------------------------------------
     */

    let amount: number;
    let externalReference: string;
    let payerEmail: string;

    let successUrl: string;
    let failureUrl: string;
    let pendingUrl: string;

    let itemId: string;
    let itemTitle: string;
    let itemDescription: string;

    /*
     * ---------------------------------------------------------
     * 4. RESERVA NORMAL
     * ---------------------------------------------------------
     */

    if (hasReservation) {
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
          error: "No se pudo obtener la reserva",
        });
      }

      if (!reservation) {
        return res.status(404).json({
          error: "Reserva no encontrada",
        });
      }

      /*
       * La lógica existente de reservas normales
       * se mantiene exactamente igual.
       */

      if (reservation.status !== "pending_payment") {
        return res.status(400).json({
          error:
            "La reserva ya no está disponible para pago.",
        });
      }

      if (reservation.payment_status !== "pending") {
        return res.status(400).json({
          error:
            "La reserva no está pendiente de pago.",
        });
      }

      amount = Number(reservation.deposit_amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          error:
            "La reserva no tiene un importe válido para cobrar",
        });
      }

      externalReference = reservation.id;
      payerEmail = reservation.customer_email;

      itemId = reservation.id;
      itemTitle = "Seña - Cancha";
      itemDescription = "Seña para reservar la cancha";

    /*
     * ---------------------------------------------------------
     * 5. CUOTA MENSUAL DE GIMNASIO
     * ---------------------------------------------------------
     */

    } else {
      const {
        data: fee,
        error: feeError,
      } = await supabaseAdmin
        .from("gym_monthly_fees")
        .select("*")
        .eq("id", gym_monthly_fee_id)
        .eq("club_id", club_id)
        .maybeSingle();

      if (feeError) {
        console.error(
          "Error buscando cuota de gimnasio:",
          feeError,
        );

        return res.status(500).json({
          error: "No se pudo obtener la cuota de gimnasio",
        });
      }

      if (!fee) {
        return res.status(404).json({
          error: "Cuota de gimnasio no encontrada",
        });
      }

      /*
       * Solo una cuota pendiente de pago
       * puede generar una Preference.
       */

      if (fee.status !== "pending_payment") {
        return res.status(400).json({
          error:
            "La cuota ya no está disponible para pago.",
        });
      }

      if (fee.payment_status !== "pending") {
        return res.status(400).json({
          error:
            "La cuota no está pendiente de pago.",
        });
      }

      amount = Number(fee.total_amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          error:
            "La cuota no tiene un importe válido para cobrar",
        });
      }

      /*
       * Prefijo propio para que el webhook pueda distinguir
       * una cuota de una reserva normal.
       */

      externalReference = `gym_fee:${fee.id}`;

      payerEmail = fee.customer_email;

      itemId = fee.id;
      itemTitle = "Cuota mensual - Gimnasio";
      itemDescription =
        `Cuota mensual de gimnasio · ${fee.total_visits} visitas`;

    }

    /*
     * ---------------------------------------------------------
     * 6. URLS
     * ---------------------------------------------------------
     */

    const appUrl =
      process.env.PUBLIC_APP_URL?.replace(/\/+$/, "");

    const apiUrl =
      process.env.PUBLIC_API_URL?.replace(/\/+$/, "");

    if (!appUrl || !apiUrl) {
      return res.status(500).json({
        error:
          "Faltan configurar PUBLIC_APP_URL o PUBLIC_API_URL",
      });
    }

    /*
     * Las cuotas usan los mismos destinos de pago,
     * pero identificadas mediante gym_monthly_fee_id.
     */

    if (hasGymFee) {
      successUrl =
        `${appUrl}/pago/exito?gym_monthly_fee_id=${encodeURIComponent(
          gym_monthly_fee_id,
        )}`;

      failureUrl =
        `${appUrl}/pago/error?gym_monthly_fee_id=${encodeURIComponent(
          gym_monthly_fee_id,
        )}`;

      pendingUrl =
        `${appUrl}/pago/pendiente?gym_monthly_fee_id=${encodeURIComponent(
          gym_monthly_fee_id,
        )}`;
    } else {
      successUrl =
        `${appUrl}/pago/exito?reservation_id=${encodeURIComponent(
          reservation_id,
        )}`;

      failureUrl =
        `${appUrl}/pago/error?reservation_id=${encodeURIComponent(
          reservation_id,
        )}`;

      pendingUrl =
        `${appUrl}/pago/pendiente?reservation_id=${encodeURIComponent(
          reservation_id,
        )}`;
    }

    /*
     * ---------------------------------------------------------
     * 7. CREAR PREFERENCE
     * ---------------------------------------------------------
     */

    const preferenceBody = {
      items: [
        {
          id: itemId,
          title: itemTitle,
          description: itemDescription,
          quantity: 1,
          currency_id: "ARS",
          unit_price: amount,
        },
      ],

      external_reference: externalReference,

      payer: {
        email: payerEmail,
      },

      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
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
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${account.access_token}`,
        },

        body: JSON.stringify(preferenceBody),
      },
    );

    const mpData = await mpResponse.json();

    console.log(
      "Mercado Pago response:",
      {
        status: mpResponse.status,
        ok: mpResponse.ok,
        id: mpData?.id,
        collector_id: mpData?.collector_id,
        marketplace_fee: mpData?.marketplace_fee,
        external_reference: externalReference,
      },
    );

    if (!mpResponse.ok) {
      console.error(
        "Mercado Pago preference error:",
        mpData,
      );

      return res.status(mpResponse.status).json({
        error:
          "Mercado Pago rechazó la creación de la Preference",

        details: mpData,
      });
    }

    /*
     * ---------------------------------------------------------
     * 8. GUARDAR EXTERNAL_REFERENCE EN LA CUOTA
     * ---------------------------------------------------------
     *
     * Para poder auditar posteriormente qué Preference
     * corresponde a la cuota.
     */

    if (hasGymFee) {
      const { error: feeUpdateError } =
        await supabaseAdmin
          .from("gym_monthly_fees")
          .update({
            external_reference: externalReference,
            updated_at: new Date().toISOString(),
          })
          .eq("id", gym_monthly_fee_id)
          .eq("club_id", club_id);

      if (feeUpdateError) {
        console.error(
          "Error guardando external_reference de la cuota:",
          feeUpdateError,
        );

        /*
         * No cancelamos el pago creado.
         * La Preference ya existe y el webhook seguirá
         * identificando la cuota mediante external_reference.
         */
      }
    }

    /*
     * ---------------------------------------------------------
     * 9. RESPUESTA
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

      external_reference:
        externalReference,
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