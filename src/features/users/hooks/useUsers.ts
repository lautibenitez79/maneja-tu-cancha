import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { userService } from "../services/user.service";

import type {
  ClubUser,
  InviteUserData,
} from "../types/user.types";

export function useUsers() {
  const { profile } = useAuth();

  const [users, setUsers] =
    useState<ClubUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadUsers =
    useCallback(async () => {
      if (!profile?.club_id) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data =
          await userService.getUsers(
            profile.club_id,
          );

        setUsers(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los usuarios.",
        );
      } finally {
        setLoading(false);
      }
    }, [profile?.club_id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function inviteUser(
    data: InviteUserData,
  ) {
    await userService.inviteUser(data);

    await loadUsers();
  }

  return {
    users,
    loading,
    error,
    inviteUser,
    reload: loadUsers,
  };
}