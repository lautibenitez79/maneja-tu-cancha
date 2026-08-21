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

    const { data, error } =
      await supabaseAdmin
        .from("club_marketplace_accounts")
        .select(`
          mp_user_id,
          token_type,
          access_token,
          refresh_token,
          expires_at
        `)
        .eq("club_id", clubId)
        .eq("provider", "mercadopago")
        .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Error leyendo OAuth",
        details: error,
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "No existe conexión Mercado Pago",
      });
    }

    const token = data.access_token ?? "";

    return res.status(200).json({
      mp_user_id: data.mp_user_id,
      token_type: data.token_type,
      token_prefix: token.substring(0, 8),
      token_length: token.length,
      has_refresh_token: Boolean(data.refresh_token),
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno",
    });
  }
}