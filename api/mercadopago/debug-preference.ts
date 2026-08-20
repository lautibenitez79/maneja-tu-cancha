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
    const preferenceId = req.query.preference_id;

    if (
      typeof preferenceId !== "string" ||
      !preferenceId
    ) {
      return res.status(400).json({
        error: "Falta preference_id",
      });
    }

    const { data: account, error } =
      await supabaseAdmin
        .from("club_marketplace_accounts")
        .select(
          `
          club_id,
          mp_user_id,
          access_token,
          token_type,
          expires_at
        `,
        )
        .eq("provider", "mercadopago")
        .eq("mp_user_id", "1450920865")
        .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Error buscando cuenta Mercado Pago",
        details: error,
      });
    }

    if (!account?.access_token) {
      return res.status(400).json({
        error: "No existe Access Token OAuth",
      });
    }

    const response = await fetch(
      `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Mercado Pago rechazó la consulta",
        details: data,
      });
    }

    /*
     * No devolvemos credenciales.
     */
    return res.status(200).json({
      id: data.id,
      collector_id: data.collector_id,
      client_id: data.client_id,
      marketplace: data.marketplace,
      marketplace_fee: data.marketplace_fee,

      items: data.items,

      payer: data.payer,

      external_reference:
        data.external_reference,

      notification_url:
        data.notification_url,

      back_urls:
        data.back_urls,

      auto_return:
        data.auto_return,

      payment_methods:
        data.payment_methods,

      expiration_date_from:
        data.expiration_date_from,

      expiration_date_to:
        data.expiration_date_to,

      date_created:
        data.date_created,
    });
  } catch (error) {
    console.error(
      "Debug preference error:",
      error,
    );

    return res.status(500).json({
      error: "Error consultando Preference",
    });
  }
}