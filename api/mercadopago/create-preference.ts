import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getValidMercadoPagoToken } from "./mercadopago-token";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { club_id, reservation_id } = req.body ?? {};

    if (!club_id || !reservation_id) {
      return res.status(400).json({
        error: "club_id y reservation_id son obligatorios",
      });
    }

    /*
     * ---------------------------------------------------------
     * 1. Buscar la conexión de Mercado Pago del club
     * ---------------------------------------------------------
     */

    // const { data: account, error: accountError } = await supabaseAdmin
    //   .from("club_marketplace_accounts")
    //   .select(
    //     `
    //       club_id,
    //       provider,
    //       mp_user_id,
    //       access_token,
    //       token_type,
    //       expires_at
    //     `,
    //   )
    //   .eq("club_id", club_id)
    //   .eq("provider", "mercadopago")
    //   .eq("active", true)
    //   .maybeSingle();

    // if (accountError) {
    //   console.error("Error buscando cuenta Mercado Pago:", accountError);

    //   return res.status(500).json({
    //     error: "No se pudo obtener la cuenta de Mercado Pago",
    //   });
    // }

    // if (!account) {
    //   return res.status(400).json({
    //     error: "El club no tiene una cuenta de Mercado Pago conectada",
    //   });
    // }

    // if (!account.access_token) {
    //   return res.status(400).json({
    //     error: "La cuenta de Mercado Pago no tiene Access Token",
    //   });
    // }

    // console.log("Mercado Pago seller:", {
    //   mp_user_id: account.mp_user_id,
    //   token_type: account.token_type,
    //   expires_at: account.expires_at,
    //   has_access_token: Boolean(account.access_token),
    // });

    /*
     * ---------------------------------------------------------
     * 2. Buscar la reserva
     * ---------------------------------------------------------
     */

    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .eq("club_id", club_id)
      .maybeSingle();

    if (reservationError) {
      console.error("Error buscando reserva:", reservationError);

      return res.status(500).json({
        error: "No se pudo obtener la reserva",
      });
    }

    if (!reservation) {
      return res.status(404).json({
        error: "Reserva no encontrada",
      });
    }

    console.log("Reserva encontrada:", {
      id: reservation.id,
      club_id: reservation.club_id,
    });

    /*
     * ---------------------------------------------------------
     * 3. Determinar el importe de la seña
     * ---------------------------------------------------------
     *
     * Mantenemos la lógica que ya te estaba funcionando.
     * Si tu columna tiene otro nombre, dejamos la que ya
     * utilizabas en tu endpoint anterior.
     */

    const amount = Number(reservation.deposit_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        error: "La reserva no tiene un importe válido para cobrar",
      });
    }

    /*
     * ---------------------------------------------------------
     * 4. Crear Preference usando EL TOKEN DEL VENDEDOR
     * ---------------------------------------------------------
     */

    const { accessToken, account: marketplaceAccount } =
      await getValidMercadoPagoToken(club_id);

      console.log("=== MP TOKEN VALIDATION ===");

console.log({
  club_id,
  mp_user_id: marketplaceAccount.mp_user_id,
  token_type: marketplaceAccount.token_type,
  expires_at: marketplaceAccount.expires_at,
  has_access_token: Boolean(accessToken),
});

    const appUrl = process.env.PUBLIC_APP_URL?.replace(/\/+$/, "");

    const apiUrl = process.env.PUBLIC_API_URL?.replace(/\/+$/, "");

    const preferenceBody = {
      items: [
        {
          id: reservation.id,
          title: "Seña - Cancha",
          description: "Seña para reservar la cancha",
          quantity: 1,
          currency_id: "ARS",
          unit_price: amount,
        },
      ],

      external_reference: reservation.id,

      payer: {
        email: reservation.customer_email,
      },

      back_urls: {
        success: `${appUrl}/pago/exito`,
        failure: `${appUrl}/pago/error`,
        pending: `${appUrl}/pago/pendiente`,
      },

      auto_return: "approved",

      notification_url: `${apiUrl}/api/mercadopago/webhook`,
    };

    /*
     * IMPORTANTE:
     *
     * NO usamos MERCADOPAGO_ACCESS_TOKEN.
     *
     * Usamos el Access Token OAuth guardado para ESTE vendedor.
     */

    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(
          preferenceBody,
        ),
      },
    );

    const mpData = await mpResponse.json();

    console.log("Mercado Pago response:", {
      status: mpResponse.status,
      ok: mpResponse.ok,
      id: mpData.id,
      collector_id: mpData.collector_id,
      marketplace_fee: mpData.marketplace_fee,
    });

    if (!mpResponse.ok) {
      console.error("Mercado Pago preference error:", mpData);

      return res.status(mpResponse.status).json({
        error: "Mercado Pago rechazó la creación de la Preference",
        details: mpData,
      });
    }

    /*
     * ---------------------------------------------------------
     * 5. Respuesta
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      preference_id: mpData.id,

      collector_id: mpData.collector_id ?? marketplaceAccount.mp_user_id,

      seller_mp_user_id: marketplaceAccount.mp_user_id,

      marketplace_fee: mpData.marketplace_fee ?? 0,

      init_point: mpData.init_point,

      sandbox_init_point: mpData.sandbox_init_point,
    });
  } catch (error) {
    console.error("Create preference error:", error);

    return res.status(500).json({
      error: "Error interno creando el pago",
    });
  }
}
