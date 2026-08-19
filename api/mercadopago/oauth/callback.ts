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
    return res.status(405).send("Método no permitido.");
  }

  try {
    const code = req.query.code;
    const state = req.query.state;

    if (typeof code !== "string") {
      return res.status(400).send(
        "No se recibió el código de autorización.",
      );
    }

    if (typeof state !== "string") {
      return res.status(400).send(
        "No se recibió el state.",
      );
    }

    const [clubId] = state.split(":");

    if (!clubId) {
      return res.status(400).send(
        "State inválido.",
      );
    }

    const tokenResponse = await fetch(
      "https://api.mercadopago.com/oauth/token",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          client_id:
            process.env.MERCADOPAGO_CLIENT_ID,

          client_secret:
            process.env.MERCADOPAGO_CLIENT_SECRET,

          grant_type: "authorization_code",

          code,

          redirect_uri:
            process.env.MERCADOPAGO_REDIRECT_URI,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error(
        "Mercado Pago token error:",
        tokenData,
      );

      return res.status(500).send(
        "No se pudo obtener el Access Token.",
      );
    }

    const {
      access_token,
      refresh_token,
      user_id,
      token_type,
      scope,
      expires_in,
    } = tokenData;

    if (!access_token) {
      return res.status(500).send(
        "Mercado Pago no devolvió un Access Token.",
      );
    }

    const expiresAt = expires_in
      ? new Date(
          Date.now() + expires_in * 1000,
        ).toISOString()
      : null;

    const { error } = await supabaseAdmin
      .from("club_marketplace_accounts")
      .upsert(
        {
          club_id: clubId,

          provider: "mercadopago",

          mp_user_id:
            user_id?.toString() ?? null,

          access_token,

          refresh_token:
            refresh_token ?? null,

          token_type:
            token_type ?? "Bearer",

          scope:
            scope ?? null,

          expires_at: expiresAt,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "club_id,provider",
        },
      );

    if (error) {
      console.error(
        "Supabase Mercado Pago error:",
        error,
      );

      return res.status(500).send(
        "No se pudo guardar la conexión.",
      );
    }

    return res.redirect(
      302,
      `${process.env.PUBLIC_APP_URL}/configuracion?mercadopago=connected`,
    );
  } catch (error) {
    console.error(
      "Mercado Pago OAuth callback error:",
      error,
    );

    return res.status(500).send(
      "Error conectando Mercado Pago.",
    );
  }
}