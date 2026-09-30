import { supabase } from "@/lib/supabase";

export type TournamentFormat = "groups_knockout" | "knockout" | "round_robin";

export type TournamentStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "finished"
  | "cancelled";

export type TournamentSport =
  | "football"
  | "padel"
  | "tennis"
  | "basketball"
  | "volleyball"
  | "hockey"
  | "other";

export interface Tournament {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  sport: TournamentSport;
  category: string | null;
  format: TournamentFormat;
  status: TournamentStatus;

  group_rounds: 1 | 2;

  start_date: string | null;
  end_date: string | null;
  max_teams: number | null;

  created_by: string;
  created_at: string;
  updated_at: string;
  slug: string;
}

export interface CreateTournamentInput {
  club_id: string;
  name: string;
  description?: string | null;
  sport: TournamentSport;
  category?: string | null;
  format: TournamentFormat;
  group_rounds?: 1 | 2;
  status: TournamentStatus;
  start_date?: string | null;
  end_date?: string | null;
  max_teams?: number | null;
}

function normalizeTournament(tournament: Tournament): Tournament {
  return tournament;
}

export const tournamentService = {
  async list(clubId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error obteniendo torneos:", error);
      throw new Error("No se pudieron cargar los torneos.");
    }

    return (data ?? []).map(normalizeTournament);
  },

  async getById(tournamentId: string): Promise<Tournament> {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (error) {
      console.error("Error obteniendo torneo:", error);
      throw new Error("No se pudo cargar el torneo.");
    }

    return normalizeTournament(data);
  },

  async create(input: CreateTournamentInput): Promise<Tournament> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("Tu sesión no es válida.");
    }

    const { data: adminCheck, error: adminCheckError } = await supabase.rpc(
      "is_club_admin",
      {
        p_club_id: input.club_id,
      },
    );

    if (adminCheckError) {
      console.error("Error comprobando admin del club:", adminCheckError);
    }

    if (!adminCheck) {
      throw new Error(
        "El usuario no tiene permisos de administrador sobre este club.",
      );
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("Ingresá el nombre del torneo.");
    }

    if (name.length > 120) {
      throw new Error(
        "El nombre del torneo no puede superar los 120 caracteres.",
      );
    }

    if (
      input.max_teams !== null &&
      input.max_teams !== undefined &&
      input.max_teams < 2
    ) {
      throw new Error("El torneo debe permitir al menos 2 parejas.");
    }

    if (
      input.start_date &&
      input.end_date &&
      input.end_date < input.start_date
    ) {
      throw new Error(
        "La fecha de finalización no puede ser anterior a la fecha de inicio.",
      );
    }

    const { data, error } = await supabase
    .from("tournaments")
    .insert({
      club_id: input.club_id,
      name: input.name,
      description: input.description ?? null,
      sport: input.sport,
      category: input.category ?? null,
      format: input.format,
      group_rounds: input.group_rounds ?? 1,
      status: input.status,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      max_teams: input.max_teams ?? null,
      created_by: userData.user.id,
    })
    .select("*")
    .single();

    if (error) {
      console.error("Error creando torneo:", error);

      throw new Error(error.message || "No se pudo crear el torneo.");
    }

    return normalizeTournament(data);
  },

  async update(
    tournamentId: string,
    input: Partial<CreateTournamentInput>,
  ): Promise<Tournament> {
    const updates: Record<string, unknown> = {
      ...input,
    };

    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();

      if (!updates.name) {
        throw new Error("Ingresá el nombre del torneo.");
      }

      if ((updates.name as string).length > 120) {
        throw new Error(
          "El nombre del torneo no puede superar los 120 caracteres.",
        );
      }
    }

    if (updates.description === "" || updates.description === undefined) {
      updates.description = null;
    }

    if (updates.category === "" || updates.category === undefined) {
      updates.category = null;
    }

    const { data, error } = await supabase
      .from("tournaments")
      .update(updates)
      .eq("id", tournamentId)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizando torneo:", error);

      throw new Error(error.message || "No se pudo actualizar el torneo.");
    }

    return normalizeTournament(data);
  },

  async remove(tournamentId: string): Promise<void> {
    const { error } = await supabase
      .from("tournaments")
      .delete()
      .eq("id", tournamentId);

    if (error) {
      console.error("Error eliminando torneo:", error);

      throw new Error(error.message || "No se pudo eliminar el torneo.");
    }
  },
};
