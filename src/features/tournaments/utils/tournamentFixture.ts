import type {
  Tournament,
  TournamentFormat,
} from "../services/tournament.service";

import type { TournamentTeam } from "../services/tournamentTeam.service";

export interface GeneratedGroup {
  name: string;
  position: number;
  teams: TournamentTeam[];
}

export interface GeneratedMatch {
  groupIndex?: number;
  phase: "group" | "knockout";
  roundNumber: number | null;
  matchNumber: number;
  teamAId: string | null;
  teamBId: string | null;
}

export interface GeneratedFixture {
  groups: GeneratedGroup[];
  matches: GeneratedMatch[];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function nextPowerOfTwo(value: number): number {
  let result = 1;

  while (result < value) {
    result *= 2;
  }

  return result;
}

function generateRoundRobin(
  teams: TournamentTeam[],
): GeneratedMatch[] {
  const list = [...teams];

  if (list.length < 2) {
    return [];
  }

  if (list.length % 2 !== 0) {
    list.push({
      id: "__BYE__",
    } as TournamentTeam);
  }

  const matches: GeneratedMatch[] = [];

  const totalRounds = list.length - 1;
  const matchesPerRound = list.length / 2;

  let rotation = [...list];

  for (
    let round = 0;
    round < totalRounds;
    round++
  ) {
    for (
      let index = 0;
      index < matchesPerRound;
      index++
    ) {
      const teamA = rotation[index];
      const teamB =
        rotation[rotation.length - 1 - index];

      if (
        teamA.id === "__BYE__" ||
        teamB.id === "__BYE__"
      ) {
        continue;
      }

      matches.push({
        phase: "group",
        roundNumber: round + 1,
        matchNumber:
          round * matchesPerRound + index + 1,
        teamAId: teamA.id,
        teamBId: teamB.id,
      });
    }

    const fixed = rotation[0];
    const rotating = rotation.slice(1);

    rotating.unshift(
      rotating.pop() as TournamentTeam,
    );

    rotation = [fixed, ...rotating];
  }

  return matches;
}

function generateKnockout(
  teams: TournamentTeam[],
): GeneratedMatch[] {
  if (teams.length < 2) {
    return [];
  }

  const shuffled = shuffle(teams);
  const bracketSize = nextPowerOfTwo(
    shuffled.length,
  );

  const slots: (TournamentTeam | null)[] = [
    ...shuffled,
  ];

  while (slots.length < bracketSize) {
    slots.push(null);
  }

  const matches: GeneratedMatch[] = [];

  const firstRoundMatches = bracketSize / 2;

  for (
    let index = 0;
    index < firstRoundMatches;
    index++
  ) {
    const teamA = slots[index * 2];
    const teamB = slots[index * 2 + 1];

    matches.push({
      phase: "knockout",
      roundNumber: 1,
      matchNumber: index + 1,
      teamAId: teamA?.id ?? null,
      teamBId: teamB?.id ?? null,
    });
  }

  let roundNumber = 2;
  let previousMatchCount = firstRoundMatches;

  while (previousMatchCount > 1) {
    const currentMatchCount =
      previousMatchCount / 2;

    for (
      let index = 0;
      index < currentMatchCount;
      index++
    ) {
      matches.push({
        phase: "knockout",
        roundNumber,
        matchNumber:
          index + 1,
        teamAId: null,
        teamBId: null,
      });
    }

    previousMatchCount = currentMatchCount;
    roundNumber++;
  }

  return matches;
}

function generateGroups(
  teams: TournamentTeam[],
): GeneratedGroup[] {
  if (teams.length < 2) {
    return [];
  }

  const groupCount = Math.min(
    Math.ceil(teams.length / 4),
    4,
  );

  const groups: GeneratedGroup[] =
    Array.from(
      { length: groupCount },
      (_, index) => ({
        name: `Grupo ${String.fromCharCode(
          65 + index,
        )}`,
        position: index + 1,
        teams: [],
      }),
    );

  const shuffled = shuffle(teams);

  shuffled.forEach((team, index) => {
    groups[index % groups.length].teams.push(
      team,
    );
  });

  return groups;
}

export function generateFixture(
  tournament: Tournament,
  teams: TournamentTeam[],
): GeneratedFixture {
  if (teams.length < 2) {
    throw new Error(
      "Necesitás al menos 2 participantes para generar el fixture.",
    );
  }

  switch (tournament.format as TournamentFormat) {
    case "knockout": {
      return {
        groups: [],
        matches: generateKnockout(teams),
      };
    }

    case "round_robin": {
      return {
        groups: [],
        matches: generateRoundRobin(teams),
      };
    }

    case "groups_knockout": {
      const groups = generateGroups(teams);

      const matches: GeneratedMatch[] = [];

      groups.forEach((group, groupIndex) => {
        const groupMatches = generateRoundRobin(
          group.teams,
        );

        groupMatches.forEach((match) => {
          matches.push({
            ...match,
            groupIndex,
          });
        });
      });

      return {
        groups,
        matches,
      };
    }

    default:
      throw new Error(
        "El formato del torneo no es válido.",
      );
  }
}