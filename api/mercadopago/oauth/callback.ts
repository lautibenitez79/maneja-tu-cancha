import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const clientId = process.env.MERCADOPAGO_CLIENT_ID;
const clientSecret =
  process.env.MERCADOPAGO_CLIENT_SECRET;
const redirectUri =
  process.env.MERCADOPAGO_REDIRECT_URI;
const publicAppUrl =
  process.env.PUBLIC_APP_URL;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).send("Método no permitido.");
  }

  try {
    console.log("=================================");
    console.log("Mercado Pago OAuth CALLBACK");
    console.log("=================================");

    const code = req.query.code;
    const state = req.query.state;

    console.log("Code recibido:", !!code);
    console.log("State recibido:", !!state);

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

    /*
     * ============================
     * DECODIFICAR STATE
     * ============================
     */

    let stateData: {
      clubId: string;
      nonce: string;
    };

    try {
      const decodedState = Buffer.from(
        state,
        "base64url",
      ).toString("utf8");

      stateData = JSON.parse(decodedState);
    } catch (error) {
      console.error(
        "Error decodificando state:",
        error,
      );

      return res.status(400).send(
        "State inválido.",
      );
    }

    const clubId = stateData.clubId;

    if (!clubId) {
      return res.status(400).send(
        "El state no contiene clubId.",
      );
    }

    console.log("Club ID:", clubId);

    /*
     * ============================
     * VALIDAR VARIABLES
     * ============================
     */

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

    /*
     * ============================
     * SUPABASE ADMIN
     * ============================
     */

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    );

    /*
     * ============================
     * INTERCAMBIAR CODE
     * POR ACCESS TOKEN
     * ============================
     */

    console.log(
      "Enviando código a Mercado Pago...",
    );

    console.log({
      clientId,
      redirectUri,
      grantType: "authorization_code",
      testToken: true,
    });

    const body = new URLSearchParams();

    body.set(
      "client_id",
      clientId,
    );

    body.set(
      "client_secret",
      clientSecret,
    );

    body.set(
      "grant_type",
      "authorization_code",
    );

    body.set(
      "code",
      code,
    );

    body.set(
      "redirect_uri",
      redirectUri,
    );

    /*
     * IMPORTANTE:
     * Estamos trabajando con credenciales
     * de prueba.
     */
    body.set(
      "test_token",
      "true",
    );

    const tokenResponse = await fetch(
      "https://api.mercadopago.com/oauth/token",
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: body.toString(),
      },
    );

    const tokenData =
      await tokenResponse.json();

    console.log(
      "Mercado Pago OAuth response:",
      {
        ok: tokenResponse.ok,
        status: tokenResponse.status,
        error: tokenData?.error,
        message: tokenData?.message,
      },
    );

    /*
     * ============================
     * ERROR DE MERCADO PAGO
     * ============================
     */

    if (!tokenResponse.ok) {
      console.error(
        "Mercado Pago rechazó el intercambio:",
        tokenData,
      );

      return res.status(500).json({
        error:
          "Mercado Pago rechazó el intercambio del código.",
        mercadoPago: tokenData,
      });
    }

    /*
     * ============================
     * DATOS DEVUELTOS
     * ============================
     */

    const {
      access_token,
      refresh_token,
      user_id,
      token_type,
      scope,
      expires_in,
      public_key,
    } = tokenData;

    if (!access_token) {
      console.error(
        "Mercado Pago no devolvió access_token:",
        tokenData,
      );

      return res.status(500).send(
        "Mercado Pago no devolvió un Access Token.",
      );
    }

    /*
     * ============================
     * FECHA DE EXPIRACIÓN
     * ============================
     */

    const expiresAt = expires_in
      ? new Date(
          Date.now() +
            Number(expires_in) * 1000,
        ).toISOString()
      : null;

    /*
     * ============================
     * GUARDAR CUENTA
     * ============================
     */

    const { error: dbError } =
      await supabaseAdmin
        .from(
          "club_marketplace_accounts",
        )
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

    if (dbError) {
      console.error(
        "Error guardando Mercado Pago en Supabase:",
        dbError,
      );

      return res.status(500).json({
        error:
          "No se pudo guardar la conexión.",
        details: dbError.message,
      });
    }

    console.log(
      "=================================",
    );

    console.log(
      "MERCADO PAGO CONECTADO CORRECTAMENTE",
    );

    console.log(
      "Club:",
      clubId,
    );

    console.log(
      "MP User:",
      user_id,
    );

    console.log(
      "=================================",
    );

    /*
     * ============================
     * VOLVER A LA APP
     * ============================
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

    return res.status(500).json({
      error:
        "Error conectando Mercado Pago.",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}