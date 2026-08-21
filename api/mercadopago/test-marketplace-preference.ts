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
    const clubId =
      "7f6cccd9-ac0b-48e0-bd2c-76bfbde9149b";

    // --------------------------------------------------
    // Obtener seller OAuth
    // --------------------------------------------------

    const { data: account, error: accountError } =
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

    if (accountError) {
      return res.status(500).json({
        error: "Error buscando cuenta",
        details: accountError,
      });
    }

    if (!account?.access_token) {
      return res.status(400).json({
        error: "No existe Access Token OAuth",
      });
    }

    console.log("=== TEST MARKETPLACE ===");

    console.log({
      seller: account.mp_user_id,
      token_prefix:
        account.access_token.substring(0, 8),
    });

    // --------------------------------------------------
    // Preference mínima
    // --------------------------------------------------

    const preference = {
      items: [
        {
          id: "TEST-MARKETPLACE-1",
          title: "Prueba Marketplace",
          description:
            "Prueba de pago Marketplace Split 1:1",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 1000,
        },
      ],

      marketplace_fee: 0,

      external_reference:
        `TEST-MARKETPLACE-${Date.now()}`,
    };

    // --------------------------------------------------
    // Crear Preference con OAuth SELLER
    // --------------------------------------------------

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${account.access_token}`,
        },

        body: JSON.stringify(preference),
      },
    );

    const mpData = await mpResponse.json();

    console.log("MP RESPONSE", {
      status: mpResponse.status,
      ok: mpResponse.ok,
      id: mpData.id,
      collector_id: mpData.collector_id,
      marketplace: mpData.marketplace,
      marketplace_fee:
        mpData.marketplace_fee,
    });

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        error: "Mercado Pago rechazó la Preference",
        details: mpData,
      });
    }

    return res.status(200).json({
      success: true,

      preference_id: mpData.id,

      collector_id:
        mpData.collector_id,

      marketplace:
        mpData.marketplace,

      marketplace_fee:
        mpData.marketplace_fee,

      external_reference:
        mpData.external_reference,

      init_point:
        mpData.init_point,

      sandbox_init_point:
        mpData.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "Marketplace test error:",
      error,
    );

    return res.status(500).json({
      error: "Error interno",
    });
  }
}