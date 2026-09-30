import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";

import {
  publicTournamentService,
  type PublicTournamentData,
  type PublicTournamentMatch,
} from "../services/publicTournament.service";

const sportLabels = {
  football: "Fútbol",
  padel: "Pádel",
  tennis: "Tenis",
  basketball: "Básquet",
  volleyball: "Vóley",
  hockey: "Hockey",
  other: "Otro",
} as const;

const formatLabels = {
  groups_knockout: "Grupos + eliminación",
  knockout: "Eliminación directa",
  round_robin: "Liga",
} as const;

const statusLabels = {
  draft: "Borrador",
  registration_open: "Inscripciones abiertas",
  registration_closed: "Inscripciones cerradas",
  in_progress: "En curso",
  finished: "Finalizado",
  cancelled: "Cancelado",
} as const;

const phaseLabels = {
  group: "Fase de grupos",
  round_of_16: "Octavos de final",
  quarterfinal: "Cuartos de final",
  semifinal: "Semifinal",
  final: "Final",
} as const;

export default function PublicTournamentPage() {
  const { slug } = useParams<{ slug: string }>();

  const [data, setData] = useState<PublicTournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function load(currentSlug: string) {
      try {
        setLoading(true);
        setNotFound(false);

        const result = await publicTournamentService.getBySlug(currentSlug);

        setData(result);
      } catch (error) {
        console.error(error);

        if (error instanceof Error && error.message === "TORNEO_NOT_FOUND") {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    load(slug);
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </main>
    );
  }

  if (notFound || !data) {
    return <PublicTournamentNotFound />;
  }

  return <PublicTournamentContent data={data} />;
}

function PublicTournamentContent({ data }: { data: PublicTournamentData }) {
  const { tournament, teams, matches, groups } = data;

  const teamMap = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  );

  const finishedMatches = matches.filter(
    (match) => match.status === "finished",
  );

  const pendingMatches = matches.filter(
    (match) => match.status !== "finished" && match.status !== "cancelled",
  );

  const championMatch = matches.find(
    (match) =>
      match.phase === "final" &&
      match.status === "finished" &&
      match.winner_team_id,
  );

  const champion = championMatch?.winner_team_id
    ? teamMap.get(championMatch.winner_team_id)
    : null;

  const isLeague = tournament.format === "round_robin";

  const isKnockout = tournament.format === "knockout";

  const isGroupsKnockout = tournament.format === "groups_knockout";

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <Trophy className="h-7 w-7 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {sportLabels[tournament.sport]}
                  </span>

                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {formatLabels[tournament.format]}
                  </span>

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {statusLabels[tournament.status]}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {tournament.name}
                </h1>

                {tournament.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {tournament.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PublicInfo
                icon={<Users className="h-4 w-4" />}
                label="Participantes"
                value={String(teams.length)}
              />

              <PublicInfo
                icon={<Trophy className="h-4 w-4" />}
                label="Partidos"
                value={String(matches.length)}
              />

              <PublicInfo
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Finalizados"
                value={String(finishedMatches.length)}
              />

              <PublicInfo
                icon={<Clock3 className="h-4 w-4" />}
                label="Pendientes"
                value={String(pendingMatches.length)}
              />
            </div>

            {(tournament.start_date || tournament.end_date) && (
              <div className="flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />

                <span>{formatDate(tournament.start_date)}</span>

                {tournament.end_date && (
                  <>
                    <span>→</span>

                    <span>{formatDate(tournament.end_date)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {champion && (
          <ChampionCard
            name={champion.name}
            player1={champion.player_1_name}
            player2={champion.player_2_name}
          />
        )}

        {/* PARTICIPANTES */}
        <section className="mt-8">
          <SectionTitle
            icon={<Users className="h-5 w-5" />}
            title="Participantes"
            description="Equipos y parejas que forman parte del torneo."
          />

          {teams.length === 0 ? (
            <EmptyState text="Todavía no hay participantes." />
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">{team.name}</p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {team.player_1_name}

                        {team.player_2_name && (
                          <>
                            <span className="mx-1">·</span>
                            {team.player_2_name}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TABLA */}
        {isLeague && (
          <section className="mt-10">
            <SectionTitle
              icon={<Trophy className="h-5 w-5" />}
              title="Tabla de posiciones"
              description="Clasificación actual según los resultados cargados."
            />

            <PublicStandings teams={teams} matches={matches} />
          </section>
        )}

        {/* GRUPOS */}
        {isGroupsKnockout && (
          <section className="mt-10">
            <SectionTitle
              icon={<Users className="h-5 w-5" />}
              title="Fase de grupos"
              description="Clasificación y partidos de cada grupo."
            />

            {groups.length === 0 ? (
              <EmptyState text="Todavía no hay grupos configurados." />
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {groups.map((group) => {
                  const groupTeamIds = group.teams.map((item) => item.team_id);

                  const groupTeams = groupTeamIds
                    .map((id) => teamMap.get(id))
                    .filter(Boolean);

                  const groupMatches = matches.filter(
                    (match) => match.group_id === group.id,
                  );

                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-border bg-card p-5"
                    >
                      <h3 className="font-semibold">{group.name}</h3>

                      <div className="mt-4">
                        {groupTeams.length > 0 && (
                          <PublicGroupStandings
                            teams={groupTeams as PublicTournamentData["teams"]}
                            matches={groupMatches}
                          />
                        )}
                      </div>

                      {groupMatches.length > 0 && (
                        <div className="mt-6 border-t border-border pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Partidos
                          </p>

                          <div className="mt-3 space-y-2">
                            {groupMatches.map((match) => (
                              <PublicMatch
                                key={match.id}
                                match={match}
                                teamMap={teamMap}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* FIXTURE */}
        <section className="mt-10">
          <SectionTitle
            icon={<Trophy className="h-5 w-5" />}
            title={
              isKnockout || isGroupsKnockout
                ? "Cuadro del torneo"
                : "Fixture y resultados"
            }
            description={
              isKnockout || isGroupsKnockout
                ? "Partidos de cada ronda de eliminación."
                : "Resultados y partidos programados."
            }
          />

          {matches.length === 0 ? (
            <EmptyState text="Todavía no hay partidos generados." />
          ) : isKnockout || isGroupsKnockout ? (
            <KnockoutBracket matches={matches} teamMap={teamMap} />
          ) : (
            <LeagueMatches matches={matches} teamMap={teamMap} />
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Torneo gestionado con Maneja Tu Cancha
        </div>
      </footer>
    </main>
  );
}

function PublicInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background">
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-0.5 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>

        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ChampionCard({
  name,
  player1,
  player2,
}: {
  name: string;
  player1: string;
  player2: string | null;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-primary/20 bg-primary/5">
      <div className="flex flex-col items-center gap-5 px-6 py-8 text-center sm:flex-row sm:text-left">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10">
          <Trophy className="h-8 w-8 text-primary" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Campeón
          </p>

          <h2 className="mt-1 text-2xl font-bold">{name}</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {player1}
            {player2 ? ` · ${player2}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function PublicGroupStandings({
  teams,
  matches,
}: {
  teams: PublicTournamentData["teams"];
  matches: PublicTournamentMatch[];
}) {
  const rows = calculateStandings(teams, matches);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Todavía no hay resultados cargados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-xs text-muted-foreground">
              <th className="px-3 py-2.5 text-left">#</th>
              <th className="px-3 py-2.5 text-left">Equipo</th>
              <th className="px-3 py-2.5 text-center">PJ</th>
              <th className="px-3 py-2.5 text-center">PG</th>
              <th className="px-3 py-2.5 text-center">PE</th>
              <th className="px-3 py-2.5 text-center">PP</th>
              <th className="px-3 py-2.5 text-center">DG</th>
              <th className="px-3 py-2.5 text-center">Pts</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const qualified = row.position <= 2;

              return (
                <tr
                  key={row.teamId}
                  className={[
                    "border-b border-border last:border-0",
                    qualified ? "bg-primary/5" : "",
                  ].join(" ")}
                >
                  <td className="px-3 py-3 font-semibold">{row.position}</td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.teamName}</span>

                      {qualified && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Clasifica
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-center">{row.played}</td>

                  <td className="px-3 py-3 text-center">{row.won}</td>

                  <td className="px-3 py-3 text-center">{row.drawn}</td>

                  <td className="px-3 py-3 text-center">{row.lost}</td>

                  <td className="px-3 py-3 text-center font-medium">
                    {row.goalDifference > 0
                      ? `+${row.goalDifference}`
                      : row.goalDifference}
                  </td>

                  <td className="px-3 py-3 text-center font-bold">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PublicStandings({
  teams,
  matches,
}: {
  teams: PublicTournamentData["teams"];
  matches: PublicTournamentMatch[];
}) {
  const rows = calculateStandings(teams, matches);

  if (rows.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState text="Todavía no hay resultados suficientes para mostrar la tabla." />
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3 text-center">PJ</th>
              <th className="px-4 py-3 text-center">PG</th>
              <th className="px-4 py-3 text-center">PE</th>
              <th className="px-4 py-3 text-center">PP</th>
              <th className="px-4 py-3 text-center">GF</th>
              <th className="px-4 py-3 text-center">GC</th>
              <th className="px-4 py-3 text-center">DG</th>
              <th className="px-4 py-3 text-center">Pts</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.teamId}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-4 font-semibold">{row.position}</td>

                <td className="px-4 py-4 font-medium">{row.teamName}</td>

                <td className="px-4 py-4 text-center">{row.played}</td>

                <td className="px-4 py-4 text-center">{row.won}</td>

                <td className="px-4 py-4 text-center">{row.drawn}</td>

                <td className="px-4 py-4 text-center">{row.lost}</td>

                <td className="px-4 py-4 text-center">{row.goalsFor}</td>

                <td className="px-4 py-4 text-center">{row.goalsAgainst}</td>

                <td className="px-4 py-4 text-center">
                  {row.goalDifference > 0
                    ? `+${row.goalDifference}`
                    : row.goalDifference}
                </td>

                <td className="px-4 py-4 text-center font-bold">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeagueMatches({
  matches,
  teamMap,
}: {
  matches: PublicTournamentMatch[];
  teamMap: Map<string, PublicTournamentData["teams"][number]>;
}) {
  const rounds = groupMatchesByRound(matches);

  return (
    <div className="mt-5 space-y-5">
      {rounds.map(([round, roundMatches]) => (
        <div
          key={round}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h3 className="font-semibold">Jornada {round}</h3>

          <div className="mt-4 grid gap-3">
            {roundMatches.map((match) => (
              <PublicMatch key={match.id} match={match} teamMap={teamMap} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KnockoutBracket({
  matches,
  teamMap,
}: {
  matches: PublicTournamentMatch[];
  teamMap: Map<string, PublicTournamentData["teams"][number]>;
}) {
  const phases = ["round_of_16", "quarterfinal", "semifinal", "final"] as const;

  const existingPhases = phases.filter((phase) =>
    matches.some((match) => match.phase === phase),
  );

  return (
    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {existingPhases.map((phase) => {
        const phaseMatches = matches.filter((match) => match.phase === phase);

        return (
          <div key={phase} className="space-y-3">
            <h3 className="text-sm font-semibold">{phaseLabels[phase]}</h3>

            {phaseMatches.map((match) => (
              <PublicMatch key={match.id} match={match} teamMap={teamMap} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PublicMatch({
  match,
  teamMap,
}: {
  match: PublicTournamentMatch;
  teamMap: Map<string, PublicTournamentData["teams"][number]>;
}) {
  const teamA = match.team_a_id ? teamMap.get(match.team_a_id) : null;

  const teamB = match.team_b_id ? teamMap.get(match.team_b_id) : null;

  const isFinished = match.status === "finished";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={[
              "truncate text-sm font-medium",
              match.winner_team_id === teamA?.id ? "font-bold" : "",
            ].join(" ")}
          >
            {teamA?.name ?? "Por definir"}
          </p>

          <p
            className={[
              "mt-2 truncate text-sm font-medium",
              match.winner_team_id === teamB?.id ? "font-bold" : "",
            ].join(" ")}
          >
            {teamB?.name ?? "Por definir"}
          </p>
        </div>

        <div className="w-12 shrink-0 text-center">
          {isFinished ? (
            <>
              <p className="text-sm font-bold">{match.score_a ?? 0}</p>

              <p className="mt-2 text-sm font-bold">{match.score_b ?? 0}</p>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span>{phaseLabels[match.phase]}</span>

        <span>{isFinished ? "Finalizado" : "Pendiente"}</span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <Trophy className="mx-auto h-7 w-7 text-muted-foreground" />

      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function PublicTournamentNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
          <Trophy className="h-7 w-7 text-muted-foreground" />
        </div>

        <h1 className="mt-5 text-2xl font-bold">Torneo no encontrado</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          El torneo que estás buscando no existe o el enlace ya no está
          disponible.
        </p>
      </div>
    </main>
  );
}

function groupMatchesByRound(matches: PublicTournamentMatch[]) {
  const map = new Map<number, PublicTournamentMatch[]>();

  for (const match of matches) {
    const round = match.round_number ?? 1;

    if (!map.has(round)) {
      map.set(round, []);
    }

    map.get(round)!.push(match);
  }

  return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
}

function calculateStandings(
  teams: PublicTournamentData["teams"],
  matches: PublicTournamentMatch[],
) {
  const rows = new Map<
    string,
    {
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
  >();

  for (const team of teams) {
    rows.set(team.id, {
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

  for (const match of matches) {
    if (
      match.phase !== "group" ||
      match.status !== "finished" ||
      !match.team_a_id ||
      !match.team_b_id ||
      match.score_a === null ||
      match.score_b === null
    ) {
      continue;
    }

    const a = rows.get(match.team_a_id);
    const b = rows.get(match.team_b_id);

    if (!a || !b) continue;

    a.played += 1;
    b.played += 1;

    a.goalsFor += match.score_a;
    a.goalsAgainst += match.score_b;

    b.goalsFor += match.score_b;
    b.goalsAgainst += match.score_a;

    if (match.score_a > match.score_b) {
      a.won += 1;
      b.lost += 1;
      a.points += 3;
    } else if (match.score_b > match.score_a) {
      b.won += 1;
      a.lost += 1;
      b.points += 3;
    } else {
      a.drawn += 1;
      b.drawn += 1;
      a.points += 1;
      b.points += 1;
    }
  }

  const result = Array.from(rows.values()).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  result.sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      b.won - a.won ||
      a.goalsAgainst - b.goalsAgainst ||
      a.teamName.localeCompare(b.teamName)
    );
  });

  return result.map((row, index) => ({
    ...row,
    position: index + 1,
  }));
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
