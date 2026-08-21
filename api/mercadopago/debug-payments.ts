import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DEFAULT_CLUB_ID =
  "7f6cccd9-ac0b-48e0-bd2c-76bfbde9149b";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const externalReference =
      req.query.external_reference;

    if (
      typeof externalReference !== "string" ||
      !externalReference
    ) {
      return res.status(400).json({
        error: "Falta external_reference",
      });
    }

    console.log(
      "=== DEBUG MERCADO PAGO PAYMENTS ===",
    );

    console.log(
      "external_reference:",
      externalReference,
    );

    /*
     * ---------------------------------------------------------
     * 1. Determinar si external_reference es UUID
     * ---------------------------------------------------------
     */

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        externalReference,
      );

    /*
     * ---------------------------------------------------------
     * 2. Buscar reserva si corresponde
     * ---------------------------------------------------------
     */

    let reservation: {
      id: string;
      club_id: string;
      deposit_amount: number;
      payment_status: string;
      status: string;
    } | null = null;

    if (isUuid) {
      const {
        data,
        error: reservationError,
      } = await supabaseAdmin
        .from("reservations")
        .select(
          `
          id,
          club_id,
          deposit_amount,
          payment_status,
          status
        `,
        )
        .eq("id", externalReference)
        .maybeSingle();

      if (reservationError) {
        return res.status(500).json({
          error: "Error buscando reserva",
          details: reservationError,
        });
      }

      reservation = data;
    }

    /*
     * ---------------------------------------------------------
     * 3. Determinar club
     * ---------------------------------------------------------
     */

    const clubId =
      reservation?.club_id ??
      DEFAULT_CLUB_ID;

    console.log("club_id:", clubId);

    /*
     * ---------------------------------------------------------
     * 4. Buscar cuenta Mercado Pago del club
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
        expires_at
      `,
      )
      .eq("club_id", clubId)
      .eq("provider", "mercadopago")
      .maybeSingle();

    if (accountError) {
      return res.status(500).json({
        error:
          "Error buscando cuenta Mercado Pago",
        details: accountError,
      });
    }

    if (!account) {
      return res.status(404).json({
        error:
          "No existe cuenta Mercado Pago para este club",
        club_id: clubId,
      });
    }

    if (!account.access_token) {
      return res.status(400).json({
        error:
          "El club no tiene Access Token OAuth",
        mp_user_id: account.mp_user_id,
      });
    }

    console.log("seller:", account.mp_user_id);

    /*
     * ---------------------------------------------------------
     * 5. Buscar pagos en Mercado Pago
     * ---------------------------------------------------------
     *
     * Mercado Pago requiere parámetros de orden y rango.
     */

    const params = new URLSearchParams({
      external_reference: externalReference,
      sort: "date_created",
      criteria: "desc",
      range: "date_created",
      begin_date: "NOW-30DAYS",
      end_date: "NOW",
      limit: "50",
      offset: "0",
    });

    const url =
      `https://api.mercadopago.com/v1/payments/search?${params.toString()}`;

    console.log(
      "Consultando Mercado Pago:",
      url,
    );

    const mpResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization:
          `Bearer ${account.access_token}`,
      },
    });

    const mpData = await mpResponse.json();

    console.log(
      "Mercado Pago response:",
      {
        status: mpResponse.status,
        ok: mpResponse.ok,
        data: mpData,
      },
    );

    /*
     * ---------------------------------------------------------
     * 6. IMPORTANTE:
     *    No ocultamos el error real de Mercado Pago
     * ---------------------------------------------------------
     */

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        error:
          "Mercado Pago rechazó la consulta de pagos",

        mercado_pago_status:
          mpResponse.status,

        mercado_pago_response:
          mpData,

        seller_mp_user_id:
          account.mp_user_id,

        external_reference:
          externalReference,
      });
    }

    /*
     * ---------------------------------------------------------
     * 7. Respuesta
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      reservation: reservation
        ? {
            id: reservation.id,
            deposit_amount:
              reservation.deposit_amount,
            payment_status:
              reservation.payment_status,
            status:
              reservation.status,
          }
        : null,

      seller: {
        mp_user_id:
          account.mp_user_id,

        token_type:
          account.token_type,

        expires_at:
          account.expires_at,
      },

      external_reference:
        externalReference,

      mercado_pago: {
        paging:
          mpData.paging ?? null,

        results:
          (mpData.results ?? []).map(
            (payment: any) => ({
              id: payment.id,

              status:
                payment.status,

              status_detail:
                payment.status_detail,

              transaction_amount:
                payment.transaction_amount,

              currency_id:
                payment.currency_id,

              payment_method_id:
                payment.payment_method_id,

              payment_type_id:
                payment.payment_type_id,

              collector_id:
                payment.collector_id,

              external_reference:
                payment.external_reference,

              date_created:
                payment.date_created,

              date_approved:
                payment.date_approved,

              live_mode:
                payment.live_mode,
            }),
          ),
      },
    });
  } catch (error) {
    console.error(
      "Debug Mercado Pago payments error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error consultando pagos",

      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}