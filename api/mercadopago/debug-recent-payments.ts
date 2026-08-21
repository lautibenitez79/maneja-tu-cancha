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
    const clubId =
      "7f6cccd9-ac0b-48e0-bd2c-76bfbde9149b";

    const { data: account, error } =
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

    if (error) {
      return res.status(500).json({
        error: "Error buscando cuenta",
        details: error,
      });
    }

    if (!account?.access_token) {
      return res.status(400).json({
        error: "No existe Access Token OAuth",
      });
    }

    const url = new URL(
      "https://api.mercadopago.com/v1/payments/search",
    );

    url.searchParams.set("sort", "date_created");
    url.searchParams.set("criteria", "desc");
    url.searchParams.set("limit", "20");

    const mpResponse = await fetch(
      url.toString(),
      {
        headers: {
          Authorization:
            `Bearer ${account.access_token}`,
        },
      },
    );

    const mpData = await mpResponse.json();

    return res.status(200).json({
      seller: {
        mp_user_id: account.mp_user_id,
        expires_at: account.expires_at,
      },

      mercado_pago: {
        status: mpResponse.status,
        ok: mpResponse.ok,
        paging: mpData.paging ?? null,

        payments: (mpData.results ?? []).map(
          (payment: any) => ({
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
            transaction_amount:
              payment.transaction_amount,
            currency_id: payment.currency_id,
            date_created:
              payment.date_created,
            date_approved:
              payment.date_approved,
            external_reference:
              payment.external_reference,
            description:
              payment.description,
            payment_method_id:
              payment.payment_method_id,
            payer_email:
              payment.payer?.email ?? null,
          }),
        ),
      },
    });
  } catch (error) {
    console.error(
      "Debug recent payments error:",
      error,
    );

    return res.status(500).json({
      error: "Error consultando pagos",
    });
  }
}