import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  /*
   * Mercado Pago espera una respuesta rápida.
   * Aceptamos POST y también devolvemos 200
   * para otras peticiones de verificación.
   */

  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
    });
  }

  try {
    console.log("=== MERCADO PAGO WEBHOOK ===");

    console.log(
      "Body:",
      JSON.stringify(req.body),
    );

    console.log(
      "Query:",
      JSON.stringify(req.query),
    );

    /*
     * ---------------------------------------------------------
     * 1. Obtener payment_id
     * ---------------------------------------------------------
     */

    let paymentId: string | null = null;

    /*
     * Formato:
     *
     * {
     *   "type": "payment",
     *   "data": {
     *     "id": "123456"
     *   }
     * }
     */

    if (
      req.body?.type === "payment" &&
      req.body?.data?.id
    ) {
      paymentId = String(
        req.body.data.id,
      );
    }

    /*
     * Compatibilidad con notificaciones antiguas:
     *
     * ?topic=payment&id=123456
     */

    if (
      !paymentId &&
      req.query.topic === "payment" &&
      req.query.id
    ) {
      paymentId = String(
        req.query.id,
      );
    }

    /*
     * Compatibilidad:
     *
     * ?type=payment&id=123456
     */

    if (
      !paymentId &&
      req.query.type === "payment" &&
      req.query.id
    ) {
      paymentId = String(
        req.query.id,
      );
    }

    /*
     * Si no es una notificación de payment,
     * simplemente la aceptamos.
     */

    if (!paymentId) {
      console.log(
        "Webhook sin payment_id.",
      );

      return res.status(200).json({
        ok: true,
        ignored: true,
      });
    }

    console.log(
      "Payment ID recibido:",
      paymentId,
    );

    /*
     * ---------------------------------------------------------
     * 2. Buscar las cuentas OAuth conectadas
     * ---------------------------------------------------------
     */

    const {
      data: accounts,
      error: accountsError,
    } = await supabaseAdmin
      .from("club_marketplace_accounts")
      .select(
        `
        club_id,
        mp_user_id,
        access_token,
        token_type
      `,
      )
      .eq("provider", "mercadopago");

    if (accountsError) {
      console.error(
        "Error buscando cuentas OAuth:",
        accountsError,
      );

      return res.status(200).json({
        ok: false,
        error:
          "Error buscando cuentas OAuth",
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. Consultar el pago directamente por ID
     * ---------------------------------------------------------
     *
     * Probamos los Access Token OAuth de los vendedores
     * conectados.
     */

    let payment: any = null;
    let sellerAccount: any = null;

    for (const account of accounts ?? []) {
      if (!account.access_token) {
        continue;
      }

      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
            paymentId,
          )}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${account.access_token}`,
            },
          },
        );

        if (!mpResponse.ok) {
          continue;
        }

        const mpData =
          await mpResponse.json();

        if (mpData?.id) {
          payment = mpData;
          sellerAccount = account;

          break;
        }
      } catch (error) {
        console.error(
          "Error consultando pago con Seller:",
          account.mp_user_id,
          error,
        );
      }
    }

    if (!payment) {
      console.error(
        "No se pudo encontrar el pago:",
        paymentId,
      );

      /*
       * Respondemos 200 para evitar reintentos
       * innecesarios durante desarrollo.
       */

      return res.status(200).json({
        ok: true,
        payment_found: false,
        payment_id: paymentId,
      });
    }

    console.log(
      "Pago encontrado:",
      {
        id: payment.id,
        status: payment.status,
        status_detail:
          payment.status_detail,
        transaction_amount:
          payment.transaction_amount,
        external_reference:
          payment.external_reference,
        collector_id:
          payment.collector_id,
      },
    );

    /*
     * ---------------------------------------------------------
     * 4. Obtener external_reference
     * ---------------------------------------------------------
     */

    const externalReference =
      payment.external_reference;

    if (!externalReference) {
      console.error(
        "El pago no tiene external_reference.",
      );

      return res.status(200).json({
        ok: true,
        payment_found: true,
        reservation_found: false,
        reason:
          "Pago sin external_reference",
      });
    }

    /*
     * ---------------------------------------------------------
     * 5. Buscar la reserva
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
        deposit_amount,
        amount_paid,
        payment_status,
        payment_id,
        status
      `,
      )
      .eq("id", externalReference)
      .maybeSingle();

    if (reservationError) {
      console.error(
        "Error buscando reserva:",
        reservationError,
      );

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: false,
        error:
          "Error buscando reserva",
      });
    }

    if (!reservation) {
      console.error(
        "Reserva no encontrada:",
        externalReference,
      );

      return res.status(200).json({
        ok: true,
        payment_found: true,
        reservation_found: false,
        external_reference:
          externalReference,
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. Determinar estado
     * ---------------------------------------------------------
     */

    const updateData: Record<
      string,
      unknown
    > = {
      payment_id: String(
        payment.id,
      ),

      updated_at:
        new Date().toISOString(),
    };

    if (
      payment.status === "approved"
    ) {
      updateData.amount_paid =
        Number(
          payment.transaction_amount,
        );

      updateData.payment_status =
        "approved";

      updateData.status =
        "confirmed";
    } else if (
      payment.status === "rejected"
    ) {
      updateData.payment_status =
        "rejected";

      updateData.status =
        "pending_payment";
    } else if (
      payment.status === "pending" ||
      payment.status === "in_process"
    ) {
      updateData.payment_status =
        "pending";
    }

    /*
     * ---------------------------------------------------------
     * 7. Actualizar reserva
     * ---------------------------------------------------------
     */

    const {
      data: updatedReservation,
      error: updateError,
    } = await supabaseAdmin
      .from("reservations")
      .update(updateData)
      .eq("id", reservation.id)
      .select(
        `
        id,
        club_id,
        amount_paid,
        payment_status,
        payment_id,
        status
      `,
      )
      .single();

    if (updateError) {
      console.error(
        "Error actualizando reserva:",
        updateError,
      );

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: true,
        error:
          "Error actualizando reserva",
        details: updateError,
      });
    }

    console.log(
      "Reserva actualizada correctamente:",
      updatedReservation,
    );

    return res.status(200).json({
      ok: true,

      payment_found: true,

      reservation_found: true,

      payment: {
        id: payment.id,
        status:
          payment.status,
        transaction_amount:
          payment.transaction_amount,
        external_reference:
          payment.external_reference,
      },

      seller: sellerAccount
        ? {
            club_id:
              sellerAccount.club_id,
            mp_user_id:
              sellerAccount.mp_user_id,
          }
        : null,

      reservation:
        updatedReservation,
    });
  } catch (error) {
    console.error(
      "Mercado Pago webhook error:",
      error,
    );

    /*
     * Durante desarrollo devolvemos 200.
     */

    return res.status(200).json({
      ok: false,
      error:
        "Error procesando webhook",
    });
  }
}