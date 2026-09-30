import {
  CalendarDays,
  ChevronRight,
  CircleStop,
  Loader2,
  Plus,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

import {
  tournamentService,
  type Tournament,
} from "../services/tournament.service";

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

function formatDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function statusClasses(
  status: Tournament["status"],
) {
  switch (status) {
    case "in_progress":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

    case "registration_open":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";

    case "finished":
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400";

    case "cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400";

    default:
      return "bg-secondary text-muted-foreground";
  }
}

export default function TournamentsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [tournaments, setTournaments] = useState<
    Tournament[]
  >([]);

  const [loading, setLoading] = useState(true);

  async function loadTournaments() {
    if (!profile?.club_id) return;

    try {
      setLoading(true);

      const data =
        await tournamentService.list(
          profile.club_id,
        );

      setTournaments(data);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los torneos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTournaments();
  }, [profile?.club_id]);

  if (!profile?.club_id || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            Competencias
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Torneos
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Creá y gestioná los torneos de tu complejo.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/tournaments/new")
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Crear torneo
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10">
            <CircleStop className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-base font-semibold">
            Todavía no tenés torneos
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Creá tu primer torneo y después vas a poder
            agregar participantes, generar el fixture y
            cargar resultados.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/tournaments/new")
            }
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Crear primer torneo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((tournament) => {
            const date = formatDate(
              tournament.start_date,
            );

            return (
              <button
                key={tournament.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard/tournaments/${tournament.id}`,
                  )
                }
                className="group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                      tournament.status,
                    )}`}
                  >
                    {
                      statusLabels[
                        tournament.status
                      ]
                    }
                  </span>
                </div>

                <h2 className="line-clamp-2 text-base font-semibold">
                  {tournament.name}
                </h2>

                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p>
                    {
                      sportLabels[
                        tournament.sport
                      ]
                    }
                    {tournament.category
                      ? ` · ${tournament.category}`
                      : ""}
                  </p>

                  <p>
                    {
                      formatLabels[
                        tournament.format
                      ]
                    }
                  </p>

                  {date && (
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {date}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-sm font-medium">
                  <span>Ver torneo</span>

                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}