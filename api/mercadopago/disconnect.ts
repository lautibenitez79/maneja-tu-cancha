import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  requireAdmin,
  supabaseAdmin,
} from "../_lib/auth";

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
    const admin = await requireAdmin(req);

    const { club_id } = req.body ?? {};

    if (!club_id) {
      return res.status(400).json({
        error: "club_id es obligatorio",
      });
    }

    /*
     * El club recibido por el frontend debe coincidir
     * con el club del usuario autenticado.
     */
    if (club_id !== admin.clubId) {
      return res.status(403).json({
        error:
          "No tenés permisos para modificar este complejo.",
      });
    }

    console.log("=== DISCONNECT MERCADO PAGO ===");
    console.log("club_id:", admin.clubId);

    const { data, error } = await supabaseAdmin
      .from("club_marketplace_accounts")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("club_id", admin.clubId)
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
    if (error instanceof Error) {
      switch (error.message) {
        case "AUTH_MISSING":
          return res.status(401).json({
            error:
              "Falta el token de autenticación.",
          });

        case "AUTH_INVALID":
          return res.status(401).json({
            error:
              "Sesión inválida o expirada.",
          });

        case "ADMIN_REQUIRED":
          return res.status(403).json({
            error:
              "Necesitás permisos de administrador.",
          });

        case "PROFILE_ERROR":
          return res.status(500).json({
            error:
              "No se pudo validar el perfil.",
          });
      }
    }

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