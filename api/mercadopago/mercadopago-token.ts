import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const clientId =
  process.env.MERCADOPAGO_CLIENT_ID;

const clientSecret =
  process.env.MERCADOPAGO_CLIENT_SECRET;

interface MercadoPagoAccount {
  club_id: string;
  mp_user_id: string;
  access_token: string;
  refresh_token: string | null;
  token_type: string;
  scope: string | null;
  expires_at: string | null;
}

interface TokenResult {
  accessToken: string;
  account: MercadoPagoAccount;
}

/**
 * Obtiene un Access Token válido para el club.
 *
 * Si el token está próximo a vencer,
 * utiliza el refresh_token para renovarlo.
 */
export async function getValidMercadoPagoToken(
  clubId: string,
): Promise<TokenResult> {
  if (!clientId) {
    throw new Error(
      "Falta MERCADOPAGO_CLIENT_ID",
    );
  }

  if (!clientSecret) {
    throw new Error(
      "Falta MERCADOPAGO_CLIENT_SECRET",
    );
  }

  const { data: account, error } =
    await supabaseAdmin
      .from("club_marketplace_accounts")
      .select(
        `
        club_id,
        mp_user_id,
        access_token,
        refresh_token,
        token_type,
        scope,
        expires_at
        `,
      )
      .eq("club_id", clubId)
      .eq("provider", "mercadopago")
      .eq("active", true)
      .maybeSingle();

  if (error) {
    console.error(
      "Error obteniendo cuenta Mercado Pago:",
      error,
    );

    throw new Error(
      "No se pudo obtener la cuenta de Mercado Pago.",
    );
  }

  if (!account) {
    throw new Error(
      "El club no tiene Mercado Pago conectado.",
    );
  }

  if (!account.access_token) {
    throw new Error(
      "La cuenta de Mercado Pago no tiene Access Token.",
    );
  }

  /*
   * ---------------------------------------------------------
   * Verificar expiración
   * ---------------------------------------------------------
   *
   * Renovamos con anticipación.
   *
   * 10 minutos antes de vencer ya consideramos
   * que necesita renovación.
   */

  const expiresAt = account.expires_at
    ? new Date(account.expires_at).getTime()
    : null;

  const now = Date.now();

  const refreshWindow =
    10 * 60 * 1000;

  const needsRefresh =
    !expiresAt ||
    expiresAt - now <= refreshWindow;

  if (!needsRefresh) {
    return {
      accessToken: account.access_token,
      account,
    };
  }

  console.log(
    "Mercado Pago Access Token próximo a vencer.",
    {
      clubId,
      mpUserId: account.mp_user_id,
      expiresAt: account.expires_at,
    },
  );

  if (!account.refresh_token) {
    throw new Error(
      "El Access Token está próximo a vencer pero la cuenta no tiene Refresh Token.",
    );
  }

  /*
   * ---------------------------------------------------------
   * Renovar token
   * ---------------------------------------------------------
   */

  const body =
    new URLSearchParams();

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
    "refresh_token",
  );

  body.set(
    "refresh_token",
    account.refresh_token,
  );

  const tokenResponse =
    await fetch(
      "https://api.mercadopago.com/oauth/token",
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: body.toString(),
      },
    );

  const tokenData =
    await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error(
      "Error renovando Access Token Mercado Pago:",
      {
        status:
          tokenResponse.status,

        error:
          tokenData?.error,

        message:
          tokenData?.message,
      },
    );

    throw new Error(
      "No se pudo renovar la conexión con Mercado Pago.",
    );
  }

  const newAccessToken =
    tokenData?.access_token;

  const newRefreshToken =
    tokenData?.refresh_token;

  const expiresIn =
    Number(
      tokenData?.expires_in,
    );

  if (!newAccessToken) {
    throw new Error(
      "Mercado Pago no devolvió un nuevo Access Token.",
    );
  }

  /*
   * Mercado Pago indica que el refresh_token
   * también debe actualizarse cuando se renueva.
   */

  const newExpiresAt =
    Number.isFinite(expiresIn)
      ? new Date(
          Date.now() +
            expiresIn * 1000,
        ).toISOString()
      : null;

  const { error: updateError } =
    await supabaseAdmin
      .from(
        "club_marketplace_accounts",
      )
      .update({
        access_token:
          newAccessToken,

        refresh_token:
          newRefreshToken ??
          account.refresh_token,

        token_type:
          tokenData?.token_type ??
          account.token_type,

        scope:
          tokenData?.scope ??
          account.scope,

        expires_at:
          newExpiresAt,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "club_id",
        clubId,
      )
      .eq(
        "provider",
        "mercadopago",
      );

  if (updateError) {
    console.error(
      "Error guardando nuevos tokens Mercado Pago:",
      updateError,
    );

    throw new Error(
      "El token fue renovado pero no se pudo guardar en la base de datos.",
    );
  }

  const updatedAccount: MercadoPagoAccount =
    {
      ...account,

      access_token:
        newAccessToken,

      refresh_token:
        newRefreshToken ??
        account.refresh_token,

      token_type:
        tokenData?.token_type ??
        account.token_type,

      scope:
        tokenData?.scope ??
        account.scope,

      expires_at:
        newExpiresAt,
    };

  console.log(
    "Mercado Pago Access Token renovado correctamente.",
    {
      clubId,
      mpUserId:
        account.mp_user_id,
      expiresAt:
        newExpiresAt,
    },
  );

  return {
    accessToken:
      newAccessToken,

    account:
      updatedAccount,
  };
}