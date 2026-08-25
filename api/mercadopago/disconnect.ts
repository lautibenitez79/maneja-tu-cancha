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
    const { club_id } = req.body ?? {};

    if (!club_id) {
      return res.status(400).json({
        error: "club_id es obligatorio",
      });
    }

    console.log("=== DISCONNECT MERCADO PAGO ===");
    console.log("club_id:", club_id);

    /*
     * No eliminamos la conexión.
     *
     * Simplemente la marcamos como inactiva.
     *
     * Esto permite volver a conectarla posteriormente
     * sin perder el registro de la cuenta.
     */

    const { data, error } = await supabaseAdmin
      .from("club_marketplace_accounts")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("club_id", club_id)
      .eq("provider", "mercadopago")
      .select(
        `
        club_id,
        provider,
        mp_user_id,
        active,
        expires_at,
        updated_at
        `,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Error desconectando Mercado Pago:",
        error,
      );

      return res.status(500).json({
        error:
          "No se pudo desconectar Mercado Pago.",
        details: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        error:
          "El club no tiene una cuenta de Mercado Pago conectada.",
      });
    }

    console.log(
      "Mercado Pago desconectado:",
      {
        club_id: data.club_id,
        mp_user_id: data.mp_user_id,
        active: data.active,
      },
    );

    return res.status(200).json({
      success: true,
      connection: data,
    });
  } catch (error) {
    console.error(
      "Disconnect Mercado Pago error:",
      error,
    );

    return res.status(500).json({
      error:
        "Error interno desconectando Mercado Pago.",
    });
  }
}