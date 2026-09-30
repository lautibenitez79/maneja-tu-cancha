import { supabase } from "@/lib/supabase";

export interface TournamentTeam {
  id: string;
  tournament_id: string;
  name: string;
  player_1_name: string;
  player_2_name: string | null;
  player_1_customer_id: string | null;
  player_2_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTournamentTeamInput {
  tournament_id: string;
  name: string;
  player_1_name: string;
  player_2_name?: string | null;
  player_1_customer_id?: string | null;
  player_2_customer_id?: string | null;
}

export interface UpdateTournamentTeamInput {
  name?: string;
  player_1_name?: string;
  player_2_name?: string | null;
  player_1_customer_id?: string | null;
  player_2_customer_id?: string | null;
}

export const tournamentTeamService = {
  async list(tournamentId: string): Promise<TournamentTeam[]> {
    const { data, error } = await supabase
      .from("tournament_teams")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading tournament teams:", error);
      throw new Error("No se pudieron cargar los participantes.");
    }

    return data ?? [];
  },

  async create(
    input: CreateTournamentTeamInput,
  ): Promise<TournamentTeam> {
    const name = input.name.trim();
    const player1 = input.player_1_name.trim();
    const player2 = input.player_2_name?.trim() || null;

    if (!name) {
      throw new Error("Ingresá el nombre del equipo o pareja.");
    }

    if (!player1) {
      throw new Error("Ingresá el nombre del jugador 1.");
    }

    if (name.length > 120) {
      throw new Error(
        "El nombre del equipo o pareja no puede superar los 120 caracteres.",
      );
    }

    if (player1.length > 120) {
      throw new Error(
        "El nombre del jugador 1 no puede superar los 120 caracteres.",
      );
    }

    if (player2 && player2.length > 120) {
      throw new Error(
        "El nombre del jugador 2 no puede superar los 120 caracteres.",
      );
    }

    const { data, error } = await supabase
      .from("tournament_teams")
      .insert({
        tournament_id: input.tournament_id,
        name,
        player_1_name: player1,
        player_2_name: player2,
        player_1_customer_id: input.player_1_customer_id ?? null,
        player_2_customer_id: input.player_2_customer_id ?? null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating tournament team:", error);

      if (error.code === "23505") {
        throw new Error(
          "Ya existe un equipo o pareja con ese nombre en este torneo.",
        );
      }

      throw new Error(
        error.message || "No se pudo agregar el participante.",
      );
    }

    return data;
  },

  async update(
    teamId: string,
    input: UpdateTournamentTeamInput,
  ): Promise<TournamentTeam> {
    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw new Error("Ingresá el nombre del equipo o pareja.");
      }

      if (name.length > 120) {
        throw new Error(
          "El nombre del equipo o pareja no puede superar los 120 caracteres.",
        );
      }

      updates.name = name;
    }

    if (input.player_1_name !== undefined) {
      const player1 = input.player_1_name.trim();

      if (!player1) {
        throw new Error("Ingresá el nombre del jugador 1.");
      }

      if (player1.length > 120) {
        throw new Error(
          "El nombre del jugador 1 no puede superar los 120 caracteres.",
        );
      }

      updates.player_1_name = player1;
    }

    if (input.player_2_name !== undefined) {
      const player2 = input.player_2_name?.trim() || null;

      if (player2 && player2.length > 120) {
        throw new Error(
          "El nombre del jugador 2 no puede superar los 120 caracteres.",
        );
      }

      updates.player_2_name = player2;
    }

    if (input.player_1_customer_id !== undefined) {
      updates.player_1_customer_id = input.player_1_customer_id;
    }

    if (input.player_2_customer_id !== undefined) {
      updates.player_2_customer_id = input.player_2_customer_id;
    }

    const { data, error } = await supabase
      .from("tournament_teams")
      .update(updates)
      .eq("id", teamId)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating tournament team:", error);

      if (error.code === "23505") {
        throw new Error(
          "Ya existe un equipo o pareja con ese nombre en este torneo.",
        );
      }

      throw new Error(
        error.message || "No se pudo actualizar el participante.",
      );
    }

    return data;
  },

  async remove(teamId: string): Promise<void> {
    const { error } = await supabase
      .from("tournament_teams")
      .delete()
      .eq("id", teamId);

    if (error) {
      console.error("Error deleting tournament team:", error);
      throw new Error("No se pudo eliminar el participante.");
    }
  },
};