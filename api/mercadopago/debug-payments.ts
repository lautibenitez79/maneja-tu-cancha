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
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const externalReference = req.query.external_reference;

    if (
      typeof externalReference !== "string" ||
      !externalReference
    ) {
      return res.status(400).json({
        error: "Falta external_reference",
      });
    }

    /*
    * Buscar la reserva
    */
    const { data: reservation, error: reservationError } =
      await supabaseAdmin
        .from("reservations")
        .select("id, club_id, deposit_amount, payment_status, status")
        .eq("id", externalReference)
        .maybeSingle();

    if (reservationError) {
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

    /*
     * Buscar el vendedor conectado
     */
    const { data: account, error: accountError } =
      await supabaseAdmin
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
        .eq("club_id", reservation.club_id)
        .eq("provider", "mercadopago")
        .maybeSingle();

    if (accountError) {
      return res.status(500).json({
        error: "Error buscando cuenta Mercado Pago",
        details: accountError,
      });
    }

    if (!account?.access_token) {
      return res.status(400).json({
        error: "El club no tiene Access Token OAuth",
      });
    }

    /*
     * Buscar pagos asociados a la reserva
     */
    const url =
      `https://api.mercadopago.com/v1/payments/search` +
      `?external_reference=${encodeURIComponent(externalReference)}`;

    const mpResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${account.access_token}`,
      },
    });

    const mpData = await mpResponse.json();

    console.log("Mercado Pago payment search:", {
      status: mpResponse.status,
      ok: mpResponse.ok,
      results: mpData.results?.length ?? 0,
    });

    return res.status(mpResponse.ok ? 200 : 500).json({
      reservation: {
        id: reservation.id,
        deposit_amount: reservation.deposit_amount,
        payment_status: reservation.payment_status,
        status: reservation.status,
      },

      seller: {
        mp_user_id: account.mp_user_id,
      },

      mercado_pago: {
        paging: mpData.paging ?? null,

        results: (mpData.results ?? []).map(
          (payment: any) => ({
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,

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
      error: "Error consultando pagos",
    });
  }
}