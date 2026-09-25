import type { VercelRequest } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export interface AuthenticatedAdmin {
  userId: string;
  email: string | null;
  clubId: string;
}

export async function requireAdmin(
  req: VercelRequest,
): Promise<AuthenticatedAdmin> {
  const authorization = String(
    req.headers.authorization ?? "",
  ).trim();

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("AUTH_MISSING");
  }

  const accessToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!accessToken) {
    throw new Error("AUTH_MISSING");
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    throw new Error("AUTH_INVALID");
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("id, email, club_id, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Error obteniendo perfil:",
      profileError,
    );

    throw new Error("PROFILE_ERROR");
  }

  if (
    !profile ||
    profile.role !== "admin" ||
    !profile.club_id
  ) {
    throw new Error("ADMIN_REQUIRED");
  }

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? null,
    clubId: profile.club_id,
  };
}

export { supabaseAdmin };