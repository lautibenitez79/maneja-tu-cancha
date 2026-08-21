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
          token_type
        `)
        .eq("club_id", clubId)
        .eq("provider", "mercadopago")
        .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Error leyendo cuenta OAuth",
        details: error,
      });
    }

    if (!account?.access_token) {
      return res.status(404).json({
        error: "No hay Access Token OAuth",
      });
    }

    const mpResponse = await fetch(
      "https://api.mercadolibre.com/users/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      },
    );

    const mpData = await mpResponse.json();

    return res.status(200).json({
      database_mp_user_id: account.mp_user_id,
      api_status: mpResponse.status,
      api_ok: mpResponse.ok,
      api_user_id: mpData.id ?? null,
      nickname: mpData.nickname ?? null,
      site_id: mpData.site_id ?? null,
      country_id: mpData.country_id ?? null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error verificando usuario OAuth",
    });
  }
}