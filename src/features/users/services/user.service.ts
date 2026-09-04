import { supabase } from "../../../lib/supabase";

import type {
  ClubUser,
  InviteUserData,
} from "../types/user.types";

export const userService = {
  async getUsers(
    clubId: string,
  ): Promise<ClubUser[]> {
    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, club_id, created_at, updated_at",
      )
      .eq("club_id", clubId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async inviteUser(
    data: InviteUserData,
  ) {
    const {
      data: {
        session,
      },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error(
        "La sesión no es válida.",
      );
    }

    const response = await fetch(
      "/api/users/invite",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "No se pudo enviar la invitación.",
      );
    }

    return result;
  },
};