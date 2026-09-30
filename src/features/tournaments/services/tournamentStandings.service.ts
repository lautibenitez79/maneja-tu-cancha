import type { TournamentMatch } from "./tournamentMatch.service";
import type { TournamentTeam } from "./tournamentTeam.service";

export interface TournamentStanding {
  position: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/**
 * Calculates a generic Round Robin / group-phase table.
 *
 * Current scoring model:
 * - Win: 3 points
 * - Draw: 1 point
 * - Loss: 0 points
 *
 * score_a / score_b are used as the numeric performance values.
 * This keeps the table compatible with football and with the current
 * tournament result model used by other sports. Sport-specific metrics
 * (sets/games, etc.) can be added later without changing the fixture logic.
 */
export function calculateTournamentStandings(
  teams: TournamentTeam[],
  matches: TournamentMatch[]
): TournamentStanding[] {
  const standings = new Map<string, TournamentStanding>();

  for (const team of teams) {
    standings.set(team.id, {
      position: 0,
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  const finishedGroupMatches = matches.filter(
    (match) =>
      match.phase === "group" &&
      match.status === "finished" &&
      match.team_a_id !== null &&
      match.team_b_id !== null &&
      match.score_a !== null &&
      match.score_b !== null
  );

  for (const match of finishedGroupMatches) {
    const teamA = standings.get(match.team_a_id!);
    const teamB = standings.get(match.team_b_id!);

    if (!teamA || !teamB) continue;

    const scoreA = match.score_a!;
    const scoreB = match.score_b!;

    teamA.played += 1;
    teamB.played += 1;

    teamA.goalsFor += scoreA;
    teamA.goalsAgainst += scoreB;

    teamB.goalsFor += scoreB;
    teamB.goalsAgainst += scoreA;

    if (scoreA > scoreB) {
      teamA.won += 1;
      teamA.points += 3;
      teamB.lost += 1;
    } else if (scoreB > scoreA) {
      teamB.won += 1;
      teamB.points += 3;
      teamA.lost += 1;
    } else {
      teamA.drawn += 1;
      teamB.drawn += 1;
      teamA.points += 1;
      teamB.points += 1;
    }
  }

  const result = Array.from(standings.values());

  for (const standing of result) {
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
  }

  result.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    if (b.goalsAgainst !== a.goalsAgainst) {
      return a.goalsAgainst - b.goalsAgainst;
    }

    if (b.won !== a.won) return b.won - a.won;

    if (b.drawn !== a.drawn) return b.drawn - a.drawn;

    if (a.lost !== b.lost) return a.lost - b.lost;

    return a.teamName.localeCompare(b.teamName, "es");
  });

  result.forEach((standing, index) => {
    standing.position = index + 1;
  });

  return result;
}

/**
 * Backwards-compatible export for any existing football consumers.
 */
export function calculateFootballStandings(
  teams: TournamentTeam[],
  matches: TournamentMatch[]
): TournamentStanding[] {
  return calculateTournamentStandings(teams, matches);
}
