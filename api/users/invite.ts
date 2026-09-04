import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Faltan variables de entorno de Supabase.",
    );

    return res.status(500).json({
      error:
        "Supabase no está configurado correctamente.",
    });
  }

  try {
    const authorization =
      req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No autenticado.",
      });
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken,
      );

    if (userError || !user) {
      return res.status(401).json({
        error: "Sesión inválida.",
      });
    }

    const {
      data: adminProfile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, club_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profileError ||
      !adminProfile
    ) {
      return res.status(403).json({
        error:
          "No se encontró el perfil del administrador.",
      });
    }

    if (
      adminProfile.role !== "admin" ||
      !adminProfile.club_id
    ) {
      return res.status(403).json({
        error:
          "No tenés permisos para invitar usuarios.",
      });
    }

    const {
      fullName,
      email,
    } = req.body ?? {};

    if (
      typeof fullName !== "string" ||
      !fullName.trim()
    ) {
      return res.status(400).json({
        error:
          "El nombre es obligatorio.",
      });
    }

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        error:
          "El email es obligatorio.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const { data: existingProfile } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (existingProfile) {
      return res.status(409).json({
        error:
          "Ya existe un usuario con ese email.",
      });
    }

    const origin =
      req.headers.origin ||
      `https://${req.headers.host}`;

    const {
      data: invitedUser,
      error: inviteError,
    } =
      await supabaseAdmin.auth.admin
        .inviteUserByEmail(
          normalizedEmail,
          {
            data: {
              full_name: fullName.trim(),
            },
            redirectTo:
              `${origin}/reset-password`,
          },
        );

    if (inviteError) {
      console.error(
        "Error invitando usuario:",
        inviteError,
      );

      return res.status(400).json({
        error:
          inviteError.message ||
          "No se pudo enviar la invitación.",
      });
    }

    if (!invitedUser.user) {
      return res.status(500).json({
        error:
          "El usuario fue invitado pero no pudo recuperarse.",
      });
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          email: normalizedEmail,
          club_id:
            adminProfile.club_id,
          role: "user",
          updated_at: new Date().toISOString(),
        })
        .eq(
          "id",
          invitedUser.user.id,
        );

    if (updateError) {
      console.error(
        "Error asociando perfil al club:",
        updateError,
      );

      return res.status(500).json({
        error:
          "El usuario fue creado pero no pudo asociarse al complejo.",
      });
    }

    return res.status(200).json({
      success: true,
      userId: invitedUser.user.id,
    });
  } catch (error) {
    console.error(
      "Error invitando usuario:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error interno invitando usuario.",
    });
  }
}