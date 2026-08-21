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

    // Buscar el vendedor conectado por OAuth
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
      console.error(accountError);

      return res.status(500).json({
        error: "Error buscando vendedor",
        details: accountError,
      });
    }

    if (!account?.access_token) {
      return res.status(400).json({
        error: "El vendedor no tiene Access Token OAuth",
      });
    }

    console.log("=== TEST OAUTH PREFERENCE ===");

    console.log({
      seller: account.mp_user_id,
      hasToken: Boolean(account.access_token),
    });

    const preference = {
      items: [
        {
          id: "test-oauth-001",
          title: "Prueba Marketplace",
          description:
            "Prueba de Checkout Pro con vendedor OAuth",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 100,
        },
      ],

      external_reference:
        "TEST-OAUTH-" + Date.now(),

      marketplace_fee: 0,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${account.access_token}`,
        },

        body: JSON.stringify(preference),
      },
    );

    const data = await response.json();

    console.log("Mercado Pago:", {
      status: response.status,
      ok: response.ok,
      id: data.id,
      collector_id: data.collector_id,
      client_id: data.client_id,
      marketplace: data.marketplace,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        mercado_pago: data,
      });
    }

    return res.status(200).json({
      success: true,

      preference_id: data.id,

      collector_id:
        data.collector_id,

      client_id:
        data.client_id,

      marketplace:
        data.marketplace,

      init_point:
        data.init_point,

      sandbox_init_point:
        data.sandbox_init_point,

      external_reference:
        data.external_reference,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno",
    });
  }
}