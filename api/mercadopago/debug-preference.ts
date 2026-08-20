import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  try {
    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    } = process.env;

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return res.status(500).json({
        error:
          "Faltan variables de Supabase.",
      });
    }

    const preferenceId =
      req.query.preference_id;

    const clubId =
      req.query.club_id;

    if (
      typeof preferenceId !== "string" ||
      !preferenceId
    ) {
      return res.status(400).json({
        error:
          "Falta preference_id.",
      });
    }

    if (
      typeof clubId !== "string" ||
      !clubId
    ) {
      return res.status(400).json({
        error: "Falta club_id.",
      });
    }

    const supabaseAdmin =
      createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
      );

    const {
      data: account,
      error: accountError,
    } = await supabaseAdmin
      .from(
        "club_marketplace_accounts",
      )
      .select(`
        mp_user_id,
        access_token
      `)
      .eq(
        "club_id",
        clubId,
      )
      .eq(
        "provider",
        "mercadopago",
      )
      .single();

    if (
      accountError ||
      !account
    ) {
      return res.status(404).json({
        error:
          "No existe conexión de Mercado Pago para este club.",
      });
    }

    if (!account.access_token) {
      return res.status(400).json({
        error:
          "El club no tiene Access Token.",
      });
    }

    const response =
      await fetch(
        `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
        {
          headers: {
            Authorization:
              `Bearer ${account.access_token}`,

            Accept:
              "application/json",
          },
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      return res.status(
        response.status,
      ).json({
        error:
          "Mercado Pago rechazó la consulta.",
        details: data,
      });
    }

    /*
     * NO devolvemos:
     * access_token
     */

    return res.status(200).json({
      id: data.id,

      collector_id:
        data.collector_id,

      client_id:
        data.client_id,

      marketplace:
        data.marketplace,

      marketplace_fee:
        data.marketplace_fee,

      items:
        data.items,

      payer:
        data.payer,

      external_reference:
        data.external_reference,

      init_point:
        data.init_point,

      notification_url:
        data.notification_url,

      date_created:
        data.date_created,
    });
  } catch (error) {
    console.error(
      "Debug preference error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error consultando Preference.",
    });
  }
}