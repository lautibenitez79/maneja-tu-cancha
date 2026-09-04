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
    const paymentId = req.query.payment_id;

    if (
      typeof paymentId !== "string" ||
      !paymentId
    ) {
      return res.status(400).json({
        error: "Falta payment_id",
      });
    }

    const clubId =
      "7f6cccd9-ac0b-48e0-bd2c-76bfbde9149b";

    const { data: account, error: accountError } =
      await supabaseAdmin
        .from("club_marketplace_accounts")
        .select(`
          mp_user_id,
          access_token,
          token_type,
          expires_at
        `)
        .eq("club_id", clubId)
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
        error: "No hay Access Token OAuth",
      });
    }

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
        paymentId,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      },
    );

    const mpData = await mpResponse.json();

    console.log(
      "=== MERCADO PAGO PAYMENT BY ID ===",
    );

    console.log({
      status: mpResponse.status,
      ok: mpResponse.ok,
      payment_id: mpData.id,
      status_payment: mpData.status,
      status_detail: mpData.status_detail,
      collector_id: mpData.collector_id,
      external_reference:
        mpData.external_reference,
    });

    return res.status(
      mpResponse.ok ? 200 : mpResponse.status,
    ).json({
      success: mpResponse.ok,

      seller: {
        mp_user_id: account.mp_user_id,
        token_type: account.token_type,
        expires_at: account.expires_at,
      },

      mercado_pago: {
        id: mpData.id ?? null,

        status:
          mpData.status ?? null,

        status_detail:
          mpData.status_detail ?? null,

        transaction_amount:
          mpData.transaction_amount ?? null,

        currency_id:
          mpData.currency_id ?? null,

        payment_method_id:
          mpData.payment_method_id ?? null,

        payment_type_id:
          mpData.payment_type_id ?? null,

        collector_id:
          mpData.collector_id ?? null,

        external_reference:
          mpData.external_reference ?? null,

        preference_id:
          mpData.preference_id ?? null,

        date_created:
          mpData.date_created ?? null,

        date_approved:
          mpData.date_approved ?? null,

        live_mode:
          mpData.live_mode ?? null,

        order:
          mpData.order ?? null,

        marketplace:
          mpData.marketplace ?? null,

        raw: mpData,
      },
    });
  } catch (error) {
    console.error(
      "Debug payment by ID error:",
      error,
    );

    return res.status(500).json({
      error: "Error consultando pago",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}