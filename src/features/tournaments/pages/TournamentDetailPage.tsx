import {
  ArrowLeft,
  CalendarDays,
  Copy,
  ExternalLink,
  Link,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  tournamentService,
  type Tournament,
} from "../services/tournament.service";

import {
  tournamentTeamService,
  type TournamentTeam,
} from "../services/tournamentTeam.service";

import {
  tournamentMatchService,
  type TournamentMatch,
} from "../services/tournamentMatch.service";

import {
  calculateTournamentStandings,
  type TournamentStanding,
} from "../services/tournamentStandings.service";

const formatLabels = {
  groups_knockout: "Grupos + eliminación",
  knockout: "Eliminación directa",
  round_robin: "Liga",
} as const;

const sportLabels = {
  football: "Fútbol",
  padel: "Pádel",
  tennis: "Tenis",
  basketball: "Básquet",
  volleyball: "Vóley",
  hockey: "Hockey",
  other: "Otro",
} as const;

const statusLabels = {
  draft: "Borrador",
  registration_open: "Inscripciones abiertas",
  registration_closed: "Inscripciones cerradas",
  in_progress: "En curso",
  finished: "Finalizado",
  cancelled: "Cancelado",
} as const;

export default function TournamentDetailPage() {
  const navigate = useNavigate();

  const { tournamentId } = useParams<{
    tournamentId: string;
  }>();

  const [tournament, setTournament] = useState<Tournament | null>(null);

  const [teams, setTeams] = useState<TournamentTeam[]>([]);

  const [matches, setMatches] = useState<TournamentMatch[]>([]);

  const [loadingMatches, setLoadingMatches] = useState(true);

  const [generatingFixture, setGeneratingFixture] = useState(false);

  const [generatingKnockout, setGeneratingKnockout] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [showTeamForm, setShowTeamForm] = useState(false);

  const [editingTeam, setEditingTeam] = useState<TournamentTeam | null>(null);

  const [savingTeam, setSavingTeam] = useState(false);

  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  const [resultMatch, setResultMatch] = useState<TournamentMatch | null>(null);

  const [savingResult, setSavingResult] = useState(false);

  const [resultError, setResultError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "dates" | "standings" | "teams"
  >("overview");

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentId) return;

    const id = tournamentId;

    async function loadTeams() {
      try {
        setLoadingTeams(true);

        const data = await tournamentTeamService.list(id);

        setTeams(data);
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los participantes.",
        );
      } finally {
        setLoadingTeams(false);
      }
    }

    loadTeams();
  }, [tournamentId]);

  async function loadTournament() {
    if (!tournamentId) return;

    try {
      setLoading(true);

      const data = await tournamentService.getById(tournamentId);

      setTournament(data);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "No se pudo cargar el torneo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMatches() {
    if (!tournamentId) return;

    try {
      setLoadingMatches(true);

      const data = await tournamentMatchService.list(tournamentId);

      setMatches(data);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el fixture.",
      );
    } finally {
      setLoadingMatches(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, [tournamentId]);

  function resetTeamForm() {
    setTeamName("");
    setPlayer1Name("");
    setPlayer2Name("");
    setEditingTeam(null);
    setShowTeamForm(false);
  }

  function openCreateTeamForm() {
    setEditingTeam(null);
    setTeamName("");
    setPlayer1Name("");
    setPlayer2Name("");
    setShowTeamForm(true);
  }

  function openEditTeamForm(team: TournamentTeam) {
    setEditingTeam(team);
    setTeamName(team.name);
    setPlayer1Name(team.player_1_name);
    setPlayer2Name(team.player_2_name ?? "");
    setShowTeamForm(true);
  }

  async function handleSaveTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tournamentId) return;

    try {
      setSavingTeam(true);

      if (editingTeam) {
        const updated = await tournamentTeamService.update(editingTeam.id, {
          name: teamName,
          player_1_name: player1Name,
          player_2_name: player2Name || null,
        });

        setTeams((current) =>
          current.map((team) => (team.id === updated.id ? updated : team)),
        );

        toast.success("Participante actualizado correctamente.");
      } else {
        if (tournament?.max_teams && teams.length >= tournament.max_teams) {
          toast.error("Se alcanzó el máximo de participantes de este torneo.");
          return;
        }

        const created = await tournamentTeamService.create({
          tournament_id: tournamentId,
          name: teamName,
          player_1_name: player1Name,
          player_2_name: player2Name || null,
        });

        setTeams((current) => [...current, created]);

        toast.success("Participante agregado correctamente.");
      }

      resetTeamForm();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el participante.",
      );
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleDeleteTeam(team: TournamentTeam) {
    const confirmed = window.confirm(`¿Eliminar "${team.name}" del torneo?`);

    if (!confirmed) return;

    try {
      setDeletingTeamId(team.id);

      await tournamentTeamService.remove(team.id);

      setTeams((current) => current.filter((item) => item.id !== team.id));

      toast.success("Participante eliminado correctamente.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el participante.",
      );
    } finally {
      setDeletingTeamId(null);
    }
  }

  async function handleGenerateFixture() {
    if (!tournamentId || !tournament) return;

    if (teams.length < 2) {
      toast.error(
        "Necesitás al menos 2 participantes para generar el fixture.",
      );
      return;
    }

    if (matches.length > 0) {
      toast.error("Este torneo ya tiene un fixture generado.");
      return;
    }

    const confirmed = window.confirm(
      "¿Querés generar el fixture de este torneo? Esta acción creará los partidos automáticamente.",
    );

    if (!confirmed) return;

    try {
      setGeneratingFixture(true);

      await tournamentMatchService.generateFixture(tournament.id);

      const generated = await tournamentMatchService.list(tournament.id);

      setMatches(generated);

      toast.success("Fixture generado correctamente.");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo generar el fixture.",
      );
    } finally {
      setGeneratingFixture(false);
    }
  }

  async function handleGenerateKnockout() {
    if (!tournamentId || !tournament) return;

    if (tournament.format !== "groups_knockout") {
      toast.error(
        "La fase eliminatoria solo corresponde a torneos con grupos + eliminación.",
      );
      return;
    }

    const groupMatches = matches.filter(
      (match) => match.phase === "group",
    );

    if (groupMatches.length === 0) {
      toast.error("Todavía no hay partidos de fase de grupos.");
      return;
    }

    const hasPendingGroupMatches = groupMatches.some(
      (match) => match.status !== "finished" && match.status !== "cancelled",
    );

    if (hasPendingGroupMatches) {
      toast.error(
        "Primero tenés que cargar todos los resultados de la fase de grupos.",
      );
      return;
    }

    const hasIncompleteGroupMatches = groupMatches.some(
      (match) => match.status !== "finished",
    );

    if (hasIncompleteGroupMatches) {
      toast.error(
        "Todos los partidos de grupos deben estar finalizados para generar el cuadro.",
      );
      return;
    }

    const hasKnockoutMatches = matches.some(
      (match) => match.phase !== "group",
    );

    if (hasKnockoutMatches) {
      toast.error("La fase eliminatoria ya fue generada.");
      return;
    }

    const confirmed = window.confirm(
      "¿Querés generar ahora la fase eliminatoria? Se tomarán los dos primeros de cada grupo según la tabla y se creará el cuadro final.",
    );

    if (!confirmed) return;

    try {
      setGeneratingKnockout(true);

      await tournamentMatchService.generateKnockoutFromGroups(
        tournament.id,
      );

      await Promise.all([loadMatches(), loadTournament()]);

      toast.success("Fase eliminatoria generada correctamente.");
    } catch (error) {
      console.error("Error generating tournament knockout:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo generar la fase eliminatoria.",
      );
    } finally {
      setGeneratingKnockout(false);
    }
  }

  function getPublicTournamentUrl() {
    if (!tournament?.slug) return "";

    return `${window.location.origin}/torneo/${tournament.slug}`;
  }

  async function handleCopyTournamentLink() {
    const url = getPublicTournamentUrl();

    if (!url) {
      toast.error("No se pudo generar el enlace del torneo.");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);

      toast.success("Enlace del torneo copiado.");
    } catch (error) {
      console.error("Error copying tournament URL:", error);

      toast.error("No se pudo copiar el enlace.");
    }
  }

  function handleShareWhatsApp() {
    const url = getPublicTournamentUrl();

    if (!url) {
      toast.error("No se pudo generar el enlace del torneo.");
      return;
    }

    const text = `Mirá el torneo "${tournament?.name}" en Maneja Tu Cancha:\n${url}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function handleShareTournament() {
    const url = getPublicTournamentUrl();

    if (!url) {
      toast.error("No se pudo generar el enlace del torneo.");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: tournament?.name ?? "Torneo",
          text: `Mirá el torneo "${tournament?.name}" en Maneja Tu Cancha.`,
          url,
        });

        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error sharing tournament:", error);
      }
    }

    await handleCopyTournamentLink();
  }

  const handleSaveMatchResult = async (input: {
    matchId: string;
    scoreA: number;
    scoreB: number;
    winnerTeamId?: string | null;
  }) => {
    try {
      setSavingResult(true);
      setResultError(null);

      await tournamentMatchService.updateResult({
        matchId: input.matchId,
        scoreA: input.scoreA,
        scoreB: input.scoreB,
        winnerTeamId: input.winnerTeamId ?? null,
      });

      setResultMatch(null);

      await Promise.all([loadMatches(), loadTournament()]);
    } catch (error) {
      console.error("Error saving match result:", error);

      setResultError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el resultado.",
      );
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No se encontró el torneo.
        </p>
      </div>
    );
  }

  const hasReachedLimit =
    tournament.max_teams !== null &&
    tournament.max_teams !== undefined &&
    teams.length >= tournament.max_teams;

  const finalMatch = matches.find(
    (match) =>
      match.phase === "final" &&
      match.status === "finished" &&
      match.winner_team_id !== null,
  );

  const champion = finalMatch
    ? (teams.find((team) => team.id === finalMatch.winner_team_id) ?? null)
    : null;

  const standings: TournamentStanding[] =
    tournament.format === "knockout" || tournament.format === "groups_knockout"
      ? []
      : calculateTournamentStandings(teams, matches);

  const groupIds = Array.from(
    new Set(
      matches
        .filter((match) => match.phase === "group" && match.group_id)
        .map((match) => match.group_id as string),
    ),
  );

  const groupStandings = groupIds.map((groupId, index) => {
    const groupMatches = matches.filter(
      (match) => match.phase === "group" && match.group_id === groupId,
    );

    const groupTeamIds = new Set<string>();

    groupMatches.forEach((match) => {
      if (match.team_a_id) groupTeamIds.add(match.team_a_id);
      if (match.team_b_id) groupTeamIds.add(match.team_b_id);
    });

    const groupTeams = teams.filter((team) => groupTeamIds.has(team.id));

    return {
      groupId,
      groupName: `Grupo ${String.fromCharCode(65 + index)}`,
      standings: calculateTournamentStandings(groupTeams, groupMatches),
    };
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate("/dashboard/tournaments")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Torneos
      </button>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                {tournament.name}
              </h1>

              {tournament.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {tournament.description}
                </p>
              )}
            </div>

            <span className="w-fit rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
              {statusLabels[tournament.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={() => {
                const url = getPublicTournamentUrl();

                if (!url) {
                  toast.error("No se pudo generar el enlace público.");
                  return;
                }

                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-secondary sm:w-auto"
            >
              <ExternalLink className="h-4 w-4" />
              Ver torneo público
            </button>

            <button
              type="button"
              onClick={handleShareTournament}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
            >
              <Share2 className="h-4 w-4" />
              Compartir torneo
            </button>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Enlace público
                </p>

                <p className="mt-1 truncate text-sm font-medium">
                  {getPublicTournamentUrl()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={handleCopyTournamentLink}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium transition hover:bg-secondary"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium transition hover:bg-secondary"
                >
                  <Link className="h-4 w-4" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Deporte" value={sportLabels[tournament.sport]} />

          <Info
            label="Categoría"
            value={tournament.category || "Sin categoría"}
          />

          <Info label="Formato" value={formatLabels[tournament.format]} />

          <Info
            label="Máximo"
            value={
              tournament.max_teams
                ? `${tournament.max_teams} parejas`
                : "Sin límite"
            }
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Deporte" value={sportLabels[tournament.sport]} />

          <Info
            label="Categoría"
            value={tournament.category || "Sin categoría"}
          />

          <Info label="Formato" value={formatLabels[tournament.format]} />

          <Info
            label="Máximo"
            value={
              tournament.max_teams
                ? `${tournament.max_teams} parejas`
                : "Sin límite"
            }
          />
        </div>

        {(tournament.start_date || tournament.end_date) && (
          <div className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />

            {tournament.start_date || "Sin fecha"}

            {tournament.end_date && (
              <>
                <span>→</span>
                {tournament.end_date}
              </>
            )}
          </div>
        )}

        {champion && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <Trophy className="h-7 w-7 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Campeón del torneo
                </p>

                <h2 className="mt-1 truncate text-xl font-semibold">
                  {champion.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  El torneo finalizó correctamente.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 border-b border-border">
          <div className="-mx-1 flex overflow-x-auto px-1">
            {[
              {
                id: "overview" as const,
                label: "Resumen",
              },
              {
                id: "dates" as const,
                label: "Fechas",
              },
              {
                id: "standings" as const,
                label: "Tabla",
              },
              {
                id: "teams" as const,
                label: "Equipos",
              },
            ].map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "relative shrink-0 px-4 py-3 text-sm font-medium transition",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.label}

                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "overview" && (
          <TournamentOverview
            tournament={tournament}
            teams={teams}
            matches={matches}
            champion={champion}
            onGoToDates={() => setActiveTab("dates")}
          />
        )}

        {activeTab === "teams" && (
          <section className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-semibold">Participantes</h2>

                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                    {teams.length}
                    {tournament.max_teams ? ` / ${tournament.max_teams}` : ""}
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Administrá las parejas o equipos inscriptos en este torneo.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateTeamForm}
                disabled={hasReachedLimit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Agregar participante
              </button>
            </div>

            {hasReachedLimit && (
              <div className="mt-4 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                Se alcanzó el máximo de participantes permitido para este
                torneo.
              </div>
            )}

            {/* FORMULARIO */}
            {showTeamForm && (
              <form
                onSubmit={handleSaveTeam}
                className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {editingTeam
                        ? "Editar participante"
                        : "Nuevo participante"}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Completá los datos del equipo o pareja.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetTeamForm}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Nombre del equipo o pareja"
                    value={teamName}
                    onChange={setTeamName}
                    placeholder="Ej. Los Pibes"
                    required
                  />

                  <Field
                    label="Jugador 1"
                    value={player1Name}
                    onChange={setPlayer1Name}
                    placeholder="Ej. Lautaro Benítez"
                    required
                  />

                  <Field
                    label="Jugador 2"
                    value={player2Name}
                    onChange={setPlayer2Name}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetTeamForm}
                    disabled={savingTeam}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={savingTeam}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {savingTeam && <Loader2 className="h-4 w-4 animate-spin" />}

                    {editingTeam ? "Guardar cambios" : "Agregar participante"}
                  </button>
                </div>
              </form>
            )}

            {/* LISTADO */}
            <div className="mt-6">
              {loadingTeams ? (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-border">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : teams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    Todavía no hay participantes
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Agregá la primera pareja o equipo para comenzar.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {teams.map((team, index) => (
                    <div
                      key={team.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">{team.name}</p>

                          <p className="mt-1 truncate text-sm text-muted-foreground">
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

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => openEditTeamForm(team)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-secondary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(team)}
                          disabled={deletingTeamId === team.id}
                          className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          title="Eliminar participante"
                        >
                          {deletingTeamId === team.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "dates" && (
          <section className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-semibold">Fixture</h2>

                  {matches.length > 0 && (
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                      {matches.length}{" "}
                      {matches.length === 1 ? "partido" : "partidos"}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Partidos y rondas del torneo.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {matches.length === 0 && (
                  <button
                    type="button"
                    onClick={handleGenerateFixture}
                    disabled={generatingFixture || teams.length < 2}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {generatingFixture ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}

                    {generatingFixture ? "Generando..." : "Generar fixture"}
                  </button>
                )}

                {tournament.format === "groups_knockout" &&
                  matches.some((match) => match.phase === "group") &&
                  matches.every(
                    (match) =>
                      match.phase === "group" ||
                      match.status === "finished" ||
                      match.status === "cancelled",
                  ) &&
                  matches
                    .filter((match) => match.phase === "group")
                    .every((match) => match.status === "finished") &&
                  !matches.some((match) => match.phase !== "group") && (
                    <button
                      type="button"
                      onClick={handleGenerateKnockout}
                      disabled={generatingKnockout}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {generatingKnockout ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trophy className="h-4 w-4" />
                      )}

                      {generatingKnockout
                        ? "Generando cuadro..."
                        : "Generar fase eliminatoria"}
                    </button>
                  )}
              </div>
            </div>

            {teams.length < 2 && (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-4 text-sm text-muted-foreground">
                Agregá al menos 2 participantes para poder generar el fixture.
              </div>
            )}

            {loadingMatches ? (
              <div className="mt-6 flex min-h-32 items-center justify-center rounded-2xl border border-border">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : matches.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  Todavía no hay fixture
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Cuando estés listo, generá automáticamente los partidos del
                  torneo.
                </p>
              </div>
            ) : (
              <FixtureList
                matches={matches}
                teams={teams}
                onLoadResult={(match) => {
                  setResultError(null);
                  setResultMatch(match);
                }}
              />
            )}
          </section>
        )}

        {activeTab === "standings" && (
          <section className="mt-8">
            <div>
              <h2 className="text-lg font-semibold">
                {tournament.format === "knockout"
                  ? "Clasificación"
                  : tournament.format === "groups_knockout"
                    ? "Tablas de grupos"
                    : "Tabla de posiciones"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {tournament.format === "knockout"
                  ? "La eliminación directa se consulta desde el fixture."
                  : tournament.format === "groups_knockout"
                    ? "Cada grupo tiene su propia clasificación. Los dos primeros avanzan al cuadro final."
                    : "Clasificación actual del torneo según los resultados cargados."}
              </p>
            </div>

            {tournament.format === "knockout" ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-center">
                <Trophy className="mx-auto h-8 w-8 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Torneo de eliminación directa
                </p>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                  Este formato no utiliza una tabla de posiciones. Los
                  participantes avanzan según los resultados de cada ronda.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab("dates")}
                  className="mt-5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
                >
                  Ver cuadro y resultados
                </button>
              </div>
            ) : tournament.format === "groups_knockout" ? (
              groupStandings.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                  <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">
                    Todavía no hay grupos generados
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Generá el fixture desde la pestaña Fechas para crear los
                    grupos y sus partidos.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-6">
                  {groupStandings.map((group) => (
                    <section
                      key={group.groupId}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <div className="flex flex-col gap-2 border-b border-border bg-secondary/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                          <h3 className="font-semibold">{group.groupName}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Clasificación y resultados del grupo.
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          Clasifican los 2 primeros
                        </span>
                      </div>

                      {group.standings.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                          Todavía no hay resultados cargados.
                        </div>
                      ) : (
                        <StandingsTable
                          standings={group.standings}
                          qualifiedPositions={2}
                        />
                      )}
                    </section>
                  ))}
                </div>
              )
            ) : standings.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  Todavía no hay participantes
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  La tabla aparecerá automáticamente cuando haya participantes
                  en el torneo.
                </p>
              </div>
            ) : (
              <StandingsTable standings={standings} />
            )}
          </section>
        )}
      </div>
      {resultMatch && (
        <MatchResultModal
          match={resultMatch}
          teams={teams}
          saving={savingResult}
          error={resultError}
          onClose={() => {
            if (!savingResult) {
              setResultMatch(null);
              setResultError(null);
            }
          }}
          onSave={handleSaveMatchResult}
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={120}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TournamentOverview({
  tournament,
  teams,
  matches,
  champion,
  onGoToDates,
}: {
  tournament: Tournament;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
  champion: TournamentTeam | null;
  onGoToDates: () => void;
}) {
  const finishedMatches = matches.filter(
    (match) => match.status === "finished",
  );

  const pendingMatches = matches.filter(
    (match) => match.status !== "finished" && match.status !== "cancelled",
  );

  const rounds = Array.from(
    new Set(matches.map((match) => match.round_number ?? 1)),
  ).sort((a, b) => a - b);

  const recentMatches = [...finishedMatches]
    .sort((a, b) => {
      const roundA = a.round_number ?? 1;
      const roundB = b.round_number ?? 1;

      if (roundA !== roundB) {
        return roundB - roundA;
      }

      return b.match_number - a.match_number;
    })
    .slice(0, 4);

  const isRoundRobin = matches.some((match) => match.phase === "group");

  function getTeamName(teamId: string | null) {
    if (!teamId) {
      return "Por definir";
    }

    return teams.find((team) => team.id === teamId)?.name ?? "Por definir";
  }

  function getMatchTitle(match: TournamentMatch) {
    if (match.phase === "group") {
      return `Jornada ${match.round_number ?? 1}`;
    }

    return `${getPhaseLabel(match.phase)} · Ronda ${match.round_number ?? 1}`;
  }

  return (
    <section className="mt-8">
      <div>
        <h2 className="text-lg font-semibold">Resumen</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Estado general y actividad de este torneo.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <OverviewStat
          label="Participantes"
          value={teams.length.toString()}
          icon={<Users className="h-4 w-4" />}
        />

        <OverviewStat
          label="Partidos"
          value={matches.length.toString()}
          icon={<Trophy className="h-4 w-4" />}
        />

        <OverviewStat
          label="Finalizados"
          value={`${finishedMatches.length}/${matches.length}`}
          icon={<span className="text-sm">✓</span>}
        />

        <OverviewStat
          label={isRoundRobin ? "Jornadas" : "Rondas"}
          value={rounds.length.toString()}
          icon={<CalendarDays className="h-4 w-4" />}
        />
      </div>

      {tournament.status === "finished" ? (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Torneo finalizado
              </p>

              <p className="mt-1 text-sm font-medium">
                {champion
                  ? `Campeón: ${champion.name}`
                  : "El torneo fue marcado como finalizado."}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Todos los resultados disponibles quedaron registrados.
              </p>
            </div>
          </div>
        </div>
      ) : pendingMatches.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-secondary/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Próximos partidos</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Hay {pendingMatches.length}{" "}
                {pendingMatches.length === 1
                  ? "partido pendiente"
                  : "partidos pendientes"}{" "}
                de resultado.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToDates}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary sm:w-auto"
            >
              Ver fechas
            </button>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">Todavía no hay partidos</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Generá el fixture desde la pestaña Fechas cuando tengas los
            participantes listos.
          </p>

          <button
            type="button"
            onClick={onGoToDates}
            className="mt-5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
          >
            Ir a Fechas
          </button>
        </div>
      ) : null}

      {recentMatches.length > 0 && (
        <div className="mt-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Últimos resultados</h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Resultados más recientes cargados en el torneo.
            </p>
          </div>

          <div className="grid gap-3">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {getMatchTitle(match)}
                  </p>

                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                    Finalizado
                  </span>
                </div>

                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-3 py-2.5">
                    <span className="min-w-0 truncate text-sm font-medium">
                      {getTeamName(match.team_a_id)}
                    </span>

                    <span className="shrink-0 text-base font-semibold">
                      {match.score_a ?? "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-3 py-2.5">
                    <span className="min-w-0 truncate text-sm font-medium">
                      {getTeamName(match.team_b_id)}
                    </span>

                    <span className="shrink-0 text-base font-semibold">
                      {match.score_b ?? "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function OverviewStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function FixtureList({
  matches,
  teams,
  onLoadResult,
}: {
  matches: TournamentMatch[];
  teams: TournamentTeam[];
  onLoadResult: (match: TournamentMatch) => void;
}) {
  const hasGroupStage = matches.some((match) => match.phase === "group");
  const hasKnockoutStage = matches.some((match) => match.phase !== "group");

  if (hasGroupStage && hasKnockoutStage) {
    return (
      <div className="mt-6 space-y-10">
        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold">Fase de grupos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Partidos de cada jornada antes del cuadro final.
            </p>
          </div>

          <RoundBasedFixture
            matches={matches.filter((match) => match.phase === "group")}
            teams={teams}
            onLoadResult={onLoadResult}
            mode="groups"
          />
        </section>

        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold">Cuadro final</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Eliminación directa entre los equipos clasificados.
            </p>
          </div>

          <RoundBasedFixture
            matches={matches.filter((match) => match.phase !== "group")}
            teams={teams}
            onLoadResult={onLoadResult}
            mode="knockout"
          />
        </section>
      </div>
    );
  }

  return (
    <RoundBasedFixture
      matches={matches}
      teams={teams}
      onLoadResult={onLoadResult}
      mode={hasGroupStage ? "round_robin" : "knockout"}
    />
  );
}

function RoundBasedFixture({
  matches,
  teams,
  onLoadResult,
  mode,
}: {
  matches: TournamentMatch[];
  teams: TournamentTeam[];
  onLoadResult: (match: TournamentMatch) => void;
  mode: "groups" | "round_robin" | "knockout";
}) {
  const [selectedRound, setSelectedRound] = useState(1);

  function getTeamName(teamId: string | null) {
    if (!teamId) {
      return "Por definir";
    }

    return teams.find((team) => team.id === teamId)?.name ?? "Por definir";
  }

  const rounds = Array.from(
    new Set(matches.map((match) => match.round_number ?? 1)),
  ).sort((a, b) => a - b);

  const currentRound = rounds.includes(selectedRound)
    ? selectedRound
    : (rounds[0] ?? 1);

  const roundMatches = matches.filter(
    (match) => (match.round_number ?? 1) === currentRound,
  );

  const currentIndex = rounds.indexOf(currentRound);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < rounds.length - 1;

  function getRoundTitle() {
    if (mode === "groups" || mode === "round_robin") {
      return `Jornada ${currentRound}`;
    }

    const phases = Array.from(
      new Set(roundMatches.map((match) => match.phase)),
    );

    return phases.length === 1
      ? getPhaseLabel(phases[0])
      : `Ronda ${currentRound}`;
  }

  function getGroupName(groupId: string | null) {
    if (!groupId) return null;

    const groupIds = Array.from(
      new Set(
        matches
          .filter((match) => match.group_id)
          .map((match) => match.group_id as string),
      ),
    );

    const index = groupIds.indexOf(groupId);

    return index >= 0 ? `Grupo ${String.fromCharCode(65 + index)}` : "Grupo";
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-8 text-center">
        <Trophy className="mx-auto h-7 w-7 text-muted-foreground" />

        <p className="mt-3 text-sm font-medium">
          {mode === "knockout"
            ? "Todavía no hay cuadro final"
            : "Todavía no hay partidos"}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "knockout"
            ? "El cuadro final aparecerá cuando estén definidos los equipos clasificados."
            : "Los partidos aparecerán cuando se genere el fixture."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* NAVEGACIÓN DE JORNADAS / RONDAS */}
      <div className="mb-5 rounded-2xl border border-border bg-secondary/30 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={() => {
              if (canGoPrevious) {
                setSelectedRound(rounds[currentIndex - 1]);
              }
            }}
            className="inline-flex shrink-0 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="sm:hidden">←</span>
            <span className="hidden sm:inline">← Anterior</span>
          </button>

          <div className="min-w-0 text-center">
            <p className="text-sm font-semibold">{getRoundTitle()}</p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {currentIndex + 1} de {rounds.length}
            </p>
          </div>

          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => {
              if (canGoNext) {
                setSelectedRound(rounds[currentIndex + 1]);
              }
            }}
            className="inline-flex shrink-0 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="sm:hidden">→</span>
            <span className="hidden sm:inline">Siguiente →</span>
          </button>
        </div>

        {rounds.length > 1 && (
          <div className="mt-3">
            <select
              value={currentRound}
              onChange={(event) => setSelectedRound(Number(event.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {rounds.map((round) => {
                const roundMatchesForOption = matches.filter(
                  (match) => (match.round_number ?? 1) === round,
                );

                const phases = Array.from(
                  new Set(roundMatchesForOption.map((match) => match.phase)),
                );

                const label =
                  mode === "groups" || mode === "round_robin"
                    ? `Jornada ${round}`
                    : phases.length === 1
                      ? getPhaseLabel(phases[0])
                      : `Ronda ${round}`;

                return (
                  <option key={round} value={round}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {roundMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            teams={teams}
            onLoadResult={onLoadResult}
            groupName={mode === "groups" ? getGroupName(match.group_id) : null}
          />
        ))}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  teams,
  onLoadResult,
  groupName,
}: {
  match: TournamentMatch;
  teams: TournamentTeam[];
  onLoadResult: (match: TournamentMatch) => void;
  groupName?: string | null;
}) {
  function getTeamName(teamId: string | null) {
    if (!teamId) {
      return "Por definir";
    }

    return teams.find((team) => team.id === teamId)?.name ?? "Por definir";
  }

  const canEnterResult =
    match.status !== "finished" &&
    match.status !== "cancelled" &&
    match.team_a_id !== null &&
    match.team_b_id !== null;

  const isFinished = match.status === "finished";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {groupName && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
              {groupName}
            </span>
          )}

          <span>Partido {match.match_number}</span>
        </div>

        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
          {getMatchStatusLabel(match.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <div
          className={[
            "flex items-center justify-between gap-3 rounded-xl px-3 py-3",
            match.winner_team_id === match.team_a_id && isFinished
              ? "bg-primary/10"
              : "bg-secondary/50",
          ].join(" ")}
        >
          <span className="min-w-0 truncate text-sm font-medium">
            {getTeamName(match.team_a_id)}
          </span>

          <span className="shrink-0 text-lg font-semibold">
            {match.score_a ?? "-"}
          </span>
        </div>

        <div
          className={[
            "flex items-center justify-between gap-3 rounded-xl px-3 py-3",
            match.winner_team_id === match.team_b_id && isFinished
              ? "bg-primary/10"
              : "bg-secondary/50",
          ].join(" ")}
        >
          <span className="min-w-0 truncate text-sm font-medium">
            {getTeamName(match.team_b_id)}
          </span>

          <span className="shrink-0 text-lg font-semibold">
            {match.score_b ?? "-"}
          </span>
        </div>
      </div>

      {canEnterResult && (
        <button
          type="button"
          onClick={() => onLoadResult(match)}
          className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
        >
          Cargar resultado
        </button>
      )}
    </div>
  );
}

function StandingsTable({
  standings,
  qualifiedPositions = 0,
}: {
  standings: TournamentStanding[];
  qualifiedPositions?: number;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-3 py-3 text-left font-medium">#</th>

              <th className="px-3 py-3 text-left font-medium">Equipo</th>

              <th className="px-3 py-3 text-center font-medium">PJ</th>

              <th className="px-3 py-3 text-center font-medium">PG</th>

              <th className="px-3 py-3 text-center font-medium">PE</th>

              <th className="px-3 py-3 text-center font-medium">PP</th>

              <th className="px-3 py-3 text-center font-medium">GF</th>

              <th className="px-3 py-3 text-center font-medium">GC</th>

              <th className="px-3 py-3 text-center font-medium">DG</th>

              <th className="px-4 py-3 text-center font-semibold">PTS</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((standing) => (
              <tr
                key={standing.teamId}
                className={[
                  "border-t border-border",
                  qualifiedPositions > 0 &&
                  standing.position <= qualifiedPositions
                    ? "bg-primary/5"
                    : "",
                ].join(" ")}
              >
                <td className="px-3 py-3 font-semibold">{standing.position}</td>

                <td className="max-w-[180px] px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="block min-w-0 truncate font-medium">
                      {standing.teamName}
                    </span>

                    {qualifiedPositions > 0 &&
                      standing.position <= qualifiedPositions && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Clasifica
                        </span>
                      )}
                  </div>
                </td>

                <td className="px-3 py-3 text-center">{standing.played}</td>

                <td className="px-3 py-3 text-center">{standing.won}</td>

                <td className="px-3 py-3 text-center">{standing.drawn}</td>

                <td className="px-3 py-3 text-center">{standing.lost}</td>

                <td className="px-3 py-3 text-center">{standing.goalsFor}</td>

                <td className="px-3 py-3 text-center">
                  {standing.goalsAgainst}
                </td>

                <td className="px-3 py-3 text-center font-medium">
                  {standing.goalDifference > 0
                    ? `+${standing.goalDifference}`
                    : standing.goalDifference}
                </td>

                <td className="px-4 py-3 text-center font-bold">
                  {standing.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchResultModal({
  match,
  teams,
  saving,
  error,
  onClose,
  onSave,
}: {
  match: TournamentMatch;
  teams: TournamentTeam[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: {
    matchId: string;
    scoreA: number;
    scoreB: number;
    winnerTeamId?: string | null;
  }) => Promise<void>;
}) {
  const teamA = teams.find((team) => team.id === match.team_a_id);

  const teamB = teams.find((team) => team.id === match.team_b_id);

  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const [winnerTeamId, setWinnerTeamId] = useState<string | null>(null);

  const scoreANumber = scoreA === "" ? null : Number(scoreA);

  const scoreBNumber = scoreB === "" ? null : Number(scoreB);

  const isDraw =
    scoreANumber !== null &&
    scoreBNumber !== null &&
    scoreANumber === scoreBNumber;

  const isKnockout = match.phase !== "group";

  const needsWinnerSelection = isKnockout && isDraw;

  const canSave =
    scoreANumber !== null &&
    scoreBNumber !== null &&
    scoreANumber >= 0 &&
    scoreBNumber >= 0 &&
    (!needsWinnerSelection || winnerTeamId !== null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (scoreANumber === null || scoreBNumber === null) {
      return;
    }

    await onSave({
      matchId: match.id,
      scoreA: scoreANumber,
      scoreB: scoreBNumber,
      winnerTeamId: needsWinnerSelection ? winnerTeamId : null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-background p-5 shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Cargar resultado</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Partido {match.match_number} · {getPhaseLabel(match.phase)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="min-w-0 truncate font-medium">
                  {teamA?.name ?? "Por definir"}
                </span>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={scoreA}
                  onChange={(event) => setScoreA(event.target.value)}
                  className="h-11 w-20 rounded-xl border border-border bg-background px-3 text-center text-lg font-semibold outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="min-w-0 truncate font-medium">
                  {teamB?.name ?? "Por definir"}
                </span>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={scoreB}
                  onChange={(event) => setScoreB(event.target.value)}
                  className="h-11 w-20 rounded-xl border border-border bg-background px-3 text-center text-lg font-semibold outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {needsWinnerSelection && (
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <p className="mb-3 text-sm font-medium">
                El partido terminó empatado.
              </p>

              <p className="mb-3 text-xs text-muted-foreground">
                Seleccioná quién avanza por penales o definición.
              </p>

              <div className="grid gap-2">
                {teamA && (
                  <button
                    type="button"
                    onClick={() => setWinnerTeamId(teamA.id)}
                    className={[
                      "rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                      winnerTeamId === teamA.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-secondary",
                    ].join(" ")}
                  >
                    {teamA.name}
                  </button>
                )}

                {teamB && (
                  <button
                    type="button"
                    onClick={() => setWinnerTeamId(teamB.id)}
                    className={[
                      "rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                      winnerTeamId === teamB.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-secondary",
                    ].join(" ")}
                  >
                    {teamB.name}
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!canSave || saving}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar resultado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getPhaseLabel(phase: TournamentMatch["phase"]) {
  switch (phase) {
    case "group":
      return "Fase de grupos";

    case "round_of_16":
      return "Octavos de final";

    case "quarterfinal":
      return "Cuartos de final";

    case "semifinal":
      return "Semifinal";

    case "final":
      return "Final";

    default:
      return "Partido";
  }
}

function getMatchStatusLabel(status: TournamentMatch["status"]) {
  switch (status) {
    case "pending":
      return "Pendiente";

    case "scheduled":
      return "Programado";

    case "in_progress":
      return "En curso";

    case "finished":
      return "Finalizado";

    case "cancelled":
      return "Cancelado";

    default:
      return status;
  }
}
