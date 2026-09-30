import { supabase } from "@/lib/supabase";

export type MatchPhase =
  | "group"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";

export type MatchStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "finished"
  | "cancelled";

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  group_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  phase: MatchPhase;
  round_number: number | null;
  match_number: number;
  scheduled_at: string | null;
  status: MatchStatus;
  score_a: number | null;
  score_b: number | null;
  winner_team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TournamentGroup {
  id: string;
  tournament_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface TournamentGroupTeam {
  group_id: string;
  team_id: string;
  position: number | null;
  created_at: string;
}

const phaseOrder: Record<MatchPhase, number> = {
  group: 0,
  round_of_16: 1,
  quarterfinal: 2,
  semifinal: 3,
  final: 4,
};

export const tournamentMatchService = {
  async list(
    tournamentId: string,
  ): Promise<TournamentMatch[]> {
    const { data, error } = await supabase
      .from("tournament_matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("phase", { ascending: true })
      .order("round_number", {
        ascending: true,
        nullsFirst: true,
      })
      .order("match_number", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading tournament matches:",
        error,
      );

      throw new Error(
        "No se pudieron cargar los partidos.",
      );
    }

    const matches = (data ?? []) as TournamentMatch[];

    matches.sort((a, b) => {
      const phaseDiff =
        phaseOrder[a.phase] - phaseOrder[b.phase];

      if (phaseDiff !== 0) {
        return phaseDiff;
      }

      const roundDiff =
        (a.round_number ?? 0) -
        (b.round_number ?? 0);

      if (roundDiff !== 0) {
        return roundDiff;
      }

      return a.match_number - b.match_number;
    });

    return matches;
  },

  async listGroups(
    tournamentId: string,
  ): Promise<TournamentGroup[]> {
    const { data, error } = await supabase
      .from("tournament_groups")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("position", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading tournament groups:",
        error,
      );

      throw new Error(
        "No se pudieron cargar los grupos.",
      );
    }

    return data ?? [];
  },

  async listGroupTeams(
    groupIds: string[],
  ): Promise<TournamentGroupTeam[]> {
    if (groupIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("tournament_group_teams")
      .select("*")
      .in("group_id", groupIds)
      .order("position", {
        ascending: true,
        nullsFirst: true,
      });

    if (error) {
      console.error(
        "Error loading tournament group teams:",
        error,
      );

      throw new Error(
        "No se pudieron cargar los participantes de los grupos.",
      );
    }

    return data ?? [];
  },

  async createGroup(input: {
    tournament_id: string;
    name: string;
    position: number;
  }): Promise<TournamentGroup> {
    const { data, error } = await supabase
      .from("tournament_groups")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Error creating tournament group:",
        error,
      );

      throw new Error(
        error.message ||
          "No se pudo crear el grupo.",
      );
    }

    return data;
  },

  async assignTeamToGroup(input: {
    group_id: string;
    team_id: string;
    position?: number | null;
  }): Promise<TournamentGroupTeam> {
    const { data, error } = await supabase
      .from("tournament_group_teams")
      .insert({
        group_id: input.group_id,
        team_id: input.team_id,
        position: input.position ?? null,
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Error assigning team to group:",
        error,
      );

      throw new Error(
        error.message ||
          "No se pudo asignar el participante al grupo.",
      );
    }

    return data;
  },

  async createMatch(input: {
    tournament_id: string;
    group_id?: string | null;
    team_a_id?: string | null;
    team_b_id?: string | null;
    phase: MatchPhase;
    round_number?: number | null;
    match_number: number;
    scheduled_at?: string | null;
    status?: MatchStatus;
  }): Promise<TournamentMatch> {
    const { data, error } = await supabase
      .from("tournament_matches")
      .insert({
        tournament_id: input.tournament_id,
        group_id: input.group_id ?? null,
        team_a_id: input.team_a_id ?? null,
        team_b_id: input.team_b_id ?? null,
        phase: input.phase,
        round_number:
          input.round_number ?? null,
        match_number: input.match_number,
        scheduled_at:
          input.scheduled_at ?? null,
        status: input.status ?? "pending",
      })
      .select("*")
      .single();

    if (error) {
      console.error(
        "Error creating tournament match:",
        error,
      );

      throw new Error(
        error.message ||
          "No se pudo crear el partido.",
      );
    }

    return data;
  },

  async generateFixture(
    tournamentId: string,
  ): Promise<void> {
    const { error } = await supabase.rpc(
      "generate_tournament_fixture",
      {
        p_tournament_id: tournamentId,
      },
    );

    if (error) {
      console.error(
        "Error generating tournament fixture:",
        error,
      );

      throw new Error(
        error.message ||
          "No se pudo generar el fixture.",
      );
    }
  },

  async generateKnockoutFromGroups(
    tournamentId: string,
  ): Promise<void> {
    if (!tournamentId) {
      throw new Error(
        "No se indicó el torneo.",
      );
    }

    const { error } = await supabase.rpc(
      "generate_tournament_knockout_from_groups",
      {
        p_tournament_id: tournamentId,
      },
    );

    if (error) {
      console.error(
        "Error generating tournament knockout:",
        error,
      );

      throw new Error(
        error.message ||
          "No se pudo generar la fase eliminatoria.",
      );
    }
  },

  async updateResult(input: {
    matchId: string;
    scoreA: number;
    scoreB: number;
    winnerTeamId?: string | null;
  }): Promise<void> {
    const { error } = await supabase.rpc(
      "update_tournament_match_result",
      {
        p_match_id: input.matchId,
        p_score_a: input.scoreA,
        p_score_b: input.scoreB,
        p_winner_team_id:
          input.winnerTeamId ?? null,
      },
    );

    if (error) {
      console.error(
        "Error updating tournament match result:",
        error,
      );

      throw new Error(
        error.message ||
          "No se pudo guardar el resultado.",
      );
    }
  },
};