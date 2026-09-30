import { ArrowLeft, Check, Loader2, Trophy } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

import {
  tournamentService,
  type TournamentFormat,
  type TournamentSport,
} from "../services/tournament.service";

const formats: {
  value: TournamentFormat;
  title: string;
  description: string;
}[] = [
  {
    value: "groups_knockout",
    title: "Grupos + eliminación",
    description:
      "Las parejas juegan en grupos y las mejores clasifican al cuadro final.",
  },
  {
    value: "knockout",
    title: "Eliminación directa",
    description: "Cada cruce es eliminatorio hasta llegar a la final.",
  },
  {
    value: "round_robin",
    title: "Liga",
    description:
      "Todos juegan contra todos y se define una tabla de posiciones.",
  },
];

const sports: {
  value: TournamentSport;
  label: string;
}[] = [
  { value: "football", label: "Fútbol" },
  { value: "padel", label: "Pádel" },
  { value: "tennis", label: "Tenis" },
  { value: "basketball", label: "Básquet" },
  { value: "volleyball", label: "Vóley" },
  { value: "hockey", label: "Hockey" },
  { value: "other", label: "Otro" },
];

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState<TournamentSport>("padel");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("groups_knockout");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxTeams, setMaxTeams] = useState("");

  const [groupRounds, setGroupRounds] = useState<1 | 2>(1);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile?.club_id) {
      toast.error("No se encontró el club asociado.");
      return;
    }

    if (!name.trim()) {
      toast.error("Ingresá el nombre del torneo.");
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      toast.error(
        "La fecha de finalización no puede ser anterior a la fecha de inicio.",
      );
      return;
    }

    let parsedMaxTeams: number | null = null;

    if (maxTeams.trim()) {
      parsedMaxTeams = Number(maxTeams);

      if (!Number.isInteger(parsedMaxTeams) || parsedMaxTeams < 2) {
        toast.error(
          "La cantidad máxima de parejas debe ser un número entero mayor o igual a 2.",
        );
        return;
      }
    }

    try {
      setLoading(true);

      const tournament = await tournamentService.create({
        club_id: profile.club_id,
        name,
        description,
        sport,
        category,
        format,
        status: "draft",
        start_date: startDate || null,
        end_date: endDate || null,
        max_teams: parsedMaxTeams,
        group_rounds: format === "groups_knockout" ? groupRounds : 1,
      });

      toast.success("Torneo creado correctamente.");

      navigate(`/dashboard/tournaments/${tournament.id}`);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el torneo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate("/dashboard/tournaments")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a torneos
      </button>

      <div className="mb-8">
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
          <Trophy className="h-5 w-5 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Crear torneo</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Configurá la información básica de tu competencia.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold">Información</h2>

          <div className="mt-5 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nombre del torneo
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                placeholder="Ej. Torneo Apertura 2026"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Descripción
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Información del torneo, reglas, premios..."
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Deporte
                </label>

                <select
                  value={sport}
                  onChange={(event) =>
                    setSport(event.target.value as TournamentSport)
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  {sports.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Categoría
                </label>

                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={80}
                  placeholder="Ej. 6ta categoría"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold">Formato de competición</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Elegí cómo se va a desarrollar el torneo.
          </p>

          <div className="mt-5 grid gap-3">
            {formats.map((item) => {
              const selected = format === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormat(item.value)}
                  className={`relative rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </div>

                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {format === "groups_knockout" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Modalidad de los partidos
            </label>

            <select
              value={groupRounds}
              onChange={(e) => setGroupRounds(Number(e.target.value) as 1 | 2)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value={1}>Una rueda</option>
              <option value={2}>Ida y vuelta</option>
            </select>

            <p className="text-xs text-slate-500">
              En una rueda, cada equipo enfrenta una vez a cada rival. En ida y
              vuelta, los enfrenta dos veces.
            </p>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-base font-semibold">Fechas y participantes</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Inicio</label>

              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Finalización
              </label>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Máximo de parejas
              </label>

              <input
                type="number"
                min={2}
                step={1}
                value={maxTeams}
                onChange={(event) => setMaxTeams(event.target.value)}
                placeholder="Ej. 16"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/tournaments")}
            className="h-11 rounded-xl border border-border px-5 text-sm font-medium transition hover:bg-secondary"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear torneo
          </button>
        </div>
      </form>
    </div>
  );
}
