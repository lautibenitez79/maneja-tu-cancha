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
    const externalReference = req.query.external_reference;

    if (
      typeof externalReference !== "string" ||
      !externalReference
    ) {
      return res.status(400).json({
        error: "Falta external_reference",
      });
    }

    const clubId =
      "7f6cccd9-ac0b-48e0-bd2c-76bfbde9149b";

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
        error: "Error buscando cuenta Mercado Pago",
        details: accountError,
      });
    }

    if (!account?.access_token) {
      return res.status(400).json({
        error: "No existe Access Token OAuth",
      });
    }

    const url =
      new URL(
        "https://api.mercadopago.com/v1/payments/search",
      );

    url.searchParams.set(
      "external_reference",
      externalReference,
    );

    const mpResponse = await fetch(
      url.toString(),
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${account.access_token}`,
        },
      },
    );

    const mpData = await mpResponse.json();

    return res.status(200).json({
      seller: {
        mp_user_id: account.mp_user_id,
      },

      external_reference:
        externalReference,

      mercado_pago: {
        status: mpResponse.status,
        ok: mpResponse.ok,
        paging: mpData.paging ?? null,
        results: mpData.results ?? [],
      },
    });
  } catch (error) {
    console.error(
      "Debug Marketplace Payment error:",
      error,
    );

    return res.status(500).json({
      error: "Error consultando pagos",
    });
  }
}