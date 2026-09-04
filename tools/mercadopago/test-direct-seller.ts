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
    /*
     * ---------------------------------------------------------
     * Seller que queremos probar
     * ---------------------------------------------------------
     *
     * Este es el Seller OAuth que está conectado al Marketplace.
     */
    const sellerMpUserId = "1450920865";

    /*
     * ---------------------------------------------------------
     * 1. Buscar el OAuth del Seller en Supabase
     * ---------------------------------------------------------
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
        .eq("provider", "mercadopago")
        .eq("mp_user_id", sellerMpUserId)
        .maybeSingle();

    if (accountError) {
      console.error(
        "Error buscando Seller OAuth:",
        accountError,
      );

      return res.status(500).json({
        error: "Error buscando Seller OAuth",
        details: accountError,
      });
    }

    if (!account) {
      return res.status(404).json({
        error:
          "No existe una conexión Mercado Pago para el Seller 1450920865",
      });
    }

    if (!account.access_token) {
      return res.status(400).json({
        error:
          "El Seller 1450920865 no tiene Access Token OAuth",
      });
    }

    console.log("=== DIRECT SELLER TEST ===");

    console.log({
      expected_seller: sellerMpUserId,
      database_seller: account.mp_user_id,
      token_type: account.token_type,
      expires_at: account.expires_at,
      has_access_token: Boolean(account.access_token),
    });

    /*
     * ---------------------------------------------------------
     * 2. Crear Preference DIRECTA
     * ---------------------------------------------------------
     *
     * IMPORTANTE:
     *
     * NO usamos marketplace_fee.
     * NO usamos application_fee.
     * NO usamos el Access Token del Marketplace.
     *
     * Usamos exclusivamente el OAuth del Seller.
     */

    const externalReference =
      "TEST-DIRECT-SELLER-1450920865-" + Date.now();

    const preference = {
      items: [
        {
          id: "test-direct-seller-1450920865",

          title: "Prueba Seller 1450920865",

          description:
            "Prueba directa de Checkout Pro del Seller OAuth",

          quantity: 1,

          currency_id: "ARS",

          unit_price: 100,
        },
      ],

      external_reference: externalReference,
    };

    /*
     * ---------------------------------------------------------
     * 3. Crear Preference en Mercado Pago
     * ---------------------------------------------------------
     */

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

    console.log("Mercado Pago response:", {
      status: response.status,
      ok: response.ok,

      id: data.id,

      collector_id: data.collector_id,

      client_id: data.client_id,

      marketplace: data.marketplace,
    });

    /*
     * ---------------------------------------------------------
     * 4. Error de Mercado Pago
     * ---------------------------------------------------------
     */

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,

        seller_mp_user_id: sellerMpUserId,

        mercado_pago: data,
      });
    }

    /*
     * ---------------------------------------------------------
     * 5. Respuesta
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      seller_mp_user_id: sellerMpUserId,

      database_mp_user_id: account.mp_user_id,

      preference_id: data.id,

      collector_id: data.collector_id,

      client_id: data.client_id,

      marketplace: data.marketplace,

      external_reference:
        data.external_reference,

      init_point: data.init_point,

      sandbox_init_point:
        data.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "Direct Seller test error:",
      error,
    );

    return res.status(500).json({
      error: "Error interno",
    });
  }
}