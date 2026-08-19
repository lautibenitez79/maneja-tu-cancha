import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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
    /*
     * ============================================================
     * 1. VALIDAR VARIABLES DE ENTORNO
     * ============================================================
     */

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const clientId =
      process.env.MERCADOPAGO_CLIENT_ID;

    const clientSecret =
      process.env.MERCADOPAGO_CLIENT_SECRET;

    const redirectUri =
      process.env.MERCADOPAGO_REDIRECT_URI;

    const publicAppUrl =
      process.env.PUBLIC_APP_URL;

    if (!supabaseUrl) {
      console.error(
        "Falta SUPABASE_URL",
      );

      return res.status(500).send(
        "Falta SUPABASE_URL.",
      );
    }

    if (!supabaseServiceRoleKey) {
      console.error(
        "Falta SUPABASE_SERVICE_ROLE_KEY",
      );

      return res.status(500).send(
        "Falta SUPABASE_SERVICE_ROLE_KEY.",
      );
    }

    if (!clientId) {
      console.error(
        "Falta MERCADOPAGO_CLIENT_ID",
      );

      return res.status(500).send(
        "Falta MERCADOPAGO_CLIENT_ID.",
      );
    }

    if (!clientSecret) {
      console.error(
        "Falta MERCADOPAGO_CLIENT_SECRET",
      );

      return res.status(500).send(
        "Falta MERCADOPAGO_CLIENT_SECRET.",
      );
    }

    if (!redirectUri) {
      console.error(
        "Falta MERCADOPAGO_REDIRECT_URI",
      );

      return res.status(500).send(
        "Falta MERCADOPAGO_REDIRECT_URI.",
      );
    }

    if (!publicAppUrl) {
      console.error(
        "Falta PUBLIC_APP_URL",
      );

      return res.status(500).send(
        "Falta PUBLIC_APP_URL.",
      );
    }

    /*
     * ============================================================
     * 2. SUPABASE ADMIN
     * ============================================================
     */

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    /*
     * ============================================================
     * 3. OBTENER CODE Y STATE
     * ============================================================
     */

    const code = req.query.code;
    const state = req.query.state;

    if (typeof code !== "string" || !code) {
      return res.status(400).send(
        "No se recibió el código de autorización.",
      );
    }

    if (typeof state !== "string" || !state) {
      return res.status(400).send(
        "No se recibió el state.",
      );
    }

    console.log(
      "Mercado Pago OAuth callback recibido",
    );

    /*
     * ============================================================
     * 4. DECODIFICAR STATE
     * ============================================================
     *
     * authorize.ts genera:
     *
     * Base64URL(
     *   JSON.stringify({
     *     clubId,
     *     nonce
     *   })
     * )
     */

    let stateData: {
      clubId?: string;
      nonce?: string;
    };

    try {
      stateData = JSON.parse(
        Buffer.from(
          state,
          "base64url",
        ).toString("utf-8"),
      );
    } catch (error) {
      console.error(
        "State inválido:",
        error,
      );

      return res.status(400).send(
        "State inválido.",
      );
    }

    const clubId = stateData.clubId;

    if (!clubId) {
      return res.status(400).send(
        "El state no contiene club_id.",
      );
    }

    console.log(
      "Mercado Pago OAuth clubId:",
      clubId,
    );

    /*
     * ============================================================
     * 5. INTERCAMBIAR CODE POR ACCESS TOKEN
     * ============================================================
     */

    const tokenResponse = await fetch(
      "https://api.mercadopago.com/oauth/token",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          client_id: clientId,

          client_secret: clientSecret,

          grant_type: "authorization_code",

          code,

          redirect_uri: redirectUri,

          /*
           * Sandbox / pruebas.
           *
           * Lo vamos a mantener durante esta etapa.
           */
          test_token: true,
        }),
      },
    );

    const tokenText =
      await tokenResponse.text();

    let tokenData: any;

    try {
      tokenData = JSON.parse(
        tokenText,
      );
    } catch {
      tokenData = {
        raw: tokenText,
      };
    }

    /*
     * IMPORTANTE:
     * Nunca mostramos access_token/client_secret
     * en logs.
     */

    if (!tokenResponse.ok) {
      console.error(
        "Mercado Pago token error:",
        {
          status: tokenResponse.status,
          data: tokenData,
        },
      );

      return res.status(500).send(
        "Mercado Pago rechazó el intercambio del código.",
      );
    }

    console.log(
      "Mercado Pago OAuth token obtenido correctamente.",
    );

    /*
     * ============================================================
     * 6. EXTRAER DATOS
     * ============================================================
     */

    const {
      access_token,
      refresh_token,
      user_id,
      token_type,
      scope,
      expires_in,
    } = tokenData;

    if (!access_token) {
      console.error(
        "Mercado Pago no devolvió access_token.",
      );

      return res.status(500).send(
        "Mercado Pago no devolvió un Access Token.",
      );
    }

    const expiresAt =
      typeof expires_in === "number"
        ? new Date(
            Date.now() +
              expires_in * 1000,
          ).toISOString()
        : null;

    /*
     * ============================================================
     * 7. GUARDAR CONEXIÓN
     * ============================================================
     */

    const { error: upsertError } =
      await supabaseAdmin
        .from(
          "club_marketplace_accounts",
        )
        .upsert(
          {
            club_id: clubId,

            provider: "mercadopago",

            mp_user_id:
              user_id != null
                ? String(user_id)
                : null,

            access_token,

            refresh_token:
              refresh_token ?? null,

            token_type:
              token_type ?? "bearer",

            scope:
              scope ?? null,

            expires_at:
              expiresAt,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "club_id,provider",
          },
        );

    if (upsertError) {
      console.error(
        "Supabase Mercado Pago error:",
        upsertError,
      );

      return res.status(500).send(
        "No se pudo guardar la conexión de Mercado Pago.",
      );
    }

    console.log(
      "Mercado Pago conectado correctamente para club:",
      clubId,
    );

    /*
     * ============================================================
     * 8. VOLVER A LA CONFIGURACIÓN
     * ============================================================
     */

    return res.redirect(
      302,
      `${publicAppUrl}/configuracion?mercadopago=connected`,
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