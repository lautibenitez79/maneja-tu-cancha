import { supabase } from "@/lib/supabase";

import type { TournamentFormat, TournamentSport, TournamentStatus } from "./tournament.service";

export interface PublicTournament {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sport: TournamentSport;
  category: string | null;
  format: TournamentFormat;
  status: TournamentStatus;
  start_date: string | null;
  end_date: string | null;
  max_teams: number | null;
}

export interface PublicTournamentTeam {
  id: string;
  name: string;
  player_1_name: string;
  player_2_name: string | null;
}

export interface PublicTournamentGroup {
  id: string;
  name: string;
  position: number;
  teams: {
    team_id: string;
    position: number | null;
  }[];
}

export interface PublicTournamentMatch {
  id: string;
  group_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  phase:
    | "group"
    | "round_of_16"
    | "quarterfinal"
    | "semifinal"
    | "final";
  round_number: number | null;
  match_number: number;
  scheduled_at: string | null;
  status:
    | "pending"
    | "scheduled"
    | "in_progress"
    | "finished"
    | "cancelled";
  score_a: number | null;
  score_b: number | null;
  winner_team_id: string | null;
}

export interface PublicTournamentData {
  success: boolean;
  tournament: PublicTournament;
  teams: PublicTournamentTeam[];
  groups: PublicTournamentGroup[];
  matches: PublicTournamentMatch[];
}

interface PublicTournamentResponse {
  success: boolean;
  error?: string;
  tournament?: PublicTournament;
  teams?: PublicTournamentTeam[];
  groups?: PublicTournamentGroup[];
  matches?: PublicTournamentMatch[];
}

export const publicTournamentService = {
  async getBySlug(slug: string): Promise<PublicTournamentData> {
    const normalizedSlug = slug.trim().toLowerCase();

    if (!normalizedSlug) {
      throw new Error("Slug de torneo inválido.");
    }

    const { data, error } = await supabase.rpc("get_public_tournament", {
      p_slug: normalizedSlug,
    });

    if (error) {
      console.error("Error loading public tournament:", error);
      throw new Error("No se pudo cargar el torneo.");
    }

    const response = data as PublicTournamentResponse | null;

    if (!response?.success || !response.tournament) {
      if (response?.error === "TORNEO_NOT_FOUND") {
        throw new Error("TORNEO_NOT_FOUND");
      }

      throw new Error("No se pudo encontrar el torneo.");
    }

    return {
      success: true,
      tournament: response.tournament,
      teams: response.teams ?? [],
      groups: response.groups ?? [],
      matches: response.matches ?? [],
    };
  },
};