import { useEffect, useMemo, useState } from "react";
import { localDateTimeToUtc, normalizeEndDateTime } from "@/utils/timezone";
import { startOfWeek, addWeeks, addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import Page from "@/components/ui/Page";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

import { useCalendar } from "../hooks/useCalendar";
import WeeklyCalendar from "../components/WeeklyCalendar";
import DailyCalendar from "../components/DailyCalendar";

import { useResources } from "@/features/resources/hooks/useResources";

import type { CalendarCell } from "../types/calendar.types";

import ReservationModal from "@/features/reservations/components/ReservationModal";
import ResourceBlockModal from "@/features/reservations/components/ResourceBlockModal";

import { reservationService } from "@/features/reservations/services/reservation.service";

import type { CreateReservationForm } from "@/features/reservations/types/reservation.types";

import { clubService } from "@/features/clubs/services/club.service";

import { useAuth } from "@/hooks/useAuth";

export default function CalendarPage() {
  const { profile } = useAuth();

  const { resources, loading: loadingResources } = useResources();

  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  );

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedBlockCell, setSelectedBlockCell] =
    useState<CalendarCell | null>(null);

  const [actionCell, setActionCell] =
    useState<CalendarCell | null>(null);

  const [selectedCell, setSelectedCell] =
    useState<CalendarCell | null>(null);

  const [selectedResourceId, setSelectedResourceId] =
    useState<string>();

  const { week, loading, refresh } =
    useCalendar(selectedResourceId, weekStart);

  useEffect(() => {
    if (resources.length > 0 && !selectedResourceId) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  /*
   * Mantiene la semana cargada en sincronía con
   * la fecha seleccionada.
   *
   * En mobile podemos movernos día por día,
   * pero useCalendar continúa trabajando con semanas.
   */
  useEffect(() => {
    const nextWeekStart = startOfWeek(selectedDate, {
      weekStartsOn: 1,
    });

    if (nextWeekStart.getTime() !== weekStart.getTime()) {
      setWeekStart(nextWeekStart);
    }
  }, [selectedDate, weekStart]);

  const selectedDay = useMemo(() => {
    if (!week) return undefined;

    const date = format(selectedDate, "yyyy-MM-dd");

    return week.days.find((day) => day.date === date);
  }, [week, selectedDate]);

  async function handleCreateReservation(
    values: CreateReservationForm,
  ) {
    if (!profile?.club_id) {
      toast.error("No se encontró el club del usuario.");
      return;
    }

    try {
      const club = await clubService.getClub(profile.club_id);

      if (!club) {
        toast.error("No se encontró el club.");
        return;
      }

      const normalizedEndsAt = normalizeEndDateTime(
        values.starts_at,
        values.ends_at,
      );

      await reservationService.create(profile.club_id, {
        ...values,

        starts_at: localDateTimeToUtc(
          values.starts_at,
          club.timezone,
        ),

        ends_at: localDateTimeToUtc(
          normalizedEndsAt,
          club.timezone,
        ),
      });

      toast.success("Reserva creada correctamente.");

      setSelectedCell(null);

      await refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("No se pudo crear la reserva.");
      }
    }
  }

  function previousWeek() {
    setWeekStart((current) =>
      addWeeks(
        startOfWeek(current, {
          weekStartsOn: 1,
        }),
        -1,
      ),
    );
  }

  function nextWeek() {
    setWeekStart((current) =>
      addWeeks(
        startOfWeek(current, {
          weekStartsOn: 1,
        }),
        1,
      ),
    );
  }

  function currentWeek() {
    const today = new Date();

    setWeekStart(
      startOfWeek(today, {
        weekStartsOn: 1,
      }),
    );

    setSelectedDate(today);
  }

  function previousDay() {
    setSelectedDate((current) => addDays(current, -1));
  }

  function nextDay() {
    setSelectedDate((current) => addDays(current, 1));
  }

  function currentDay() {
    setSelectedDate(new Date());
  }

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value;

    if (!value) return;

    const [year, month, day] = value
      .split("-")
      .map(Number);

    setSelectedDate(
      new Date(year, month - 1, day),
    );
  }

  async function handleReservationUpdated() {
    await refresh();
  }

  if (loadingResources) {
    return <Loading />;
  }

  if (resources.length === 0) {
    return (
      <Page title="Calendario">
        <EmptyState
          title="No hay recursos"
          description="Primero creá un recurso."
        />
      </Page>
    );
  }

  if (loading && !week) {
    return <Loading />;
  }

  if (!week) {
    return (
      <Page title="Calendario">
        <EmptyState
          title="No hay datos"
          description="No fue posible cargar el calendario."
        />
      </Page>
    );
  }

  return (
    <Page
      title="Calendario"
      subtitle="Reservas semanales"
    >
      {/* CANCHA */}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          htmlFor="resource"
          className="text-sm font-medium"
        >
          Cancha
        </label>

        <select
          id="resource"
          value={selectedResourceId ?? ""}
          onChange={(event) => {
            setSelectedCell(null);
            setSelectedBlockCell(null);
            setActionCell(null);

            setSelectedResourceId(event.target.value);
          }}
          className="w-full rounded-lg border bg-[var(--color-card)] px-3 py-2 sm:w-auto"
        >
          {resources.map((resource) => (
            <option
              key={resource.id}
              value={resource.id}
            >
              {resource.name}
            </option>
          ))}
        </select>
      </div>

      {/* DESKTOP */}

      <div className="hidden lg:block">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={previousWeek}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            ← Semana anterior
          </button>

          <button
            type="button"
            onClick={currentWeek}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Esta semana
          </button>

          <button
            type="button"
            onClick={nextWeek}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Semana siguiente →
          </button>
        </div>

        <WeeklyCalendar
          week={week}
          onCellClick={(cell) => {
            if (cell.status === "available") {
              setActionCell(cell);
              return;
            }

            if (cell.status === "blocked") {
              setSelectedBlockCell(cell);
              return;
            }

            if (
              cell.status === "reserved" ||
              cell.status === "pending_payment"
            ) {
              setSelectedCell(cell);
            }
          }}
        />
      </div>

      {/* MOBILE / TABLET */}

      <div className="lg:hidden">
        <div className="mb-5 flex items-center gap-2">
          <button
            type="button"
            onClick={previousDay}
            aria-label="Día anterior"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
          >
            ←
          </button>

          <button
            type="button"
            onClick={currentDay}
            className="h-11 flex-1 rounded-lg border px-3 text-sm font-medium"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={nextDay}
            aria-label="Día siguiente"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
          >
            →
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold capitalize">
              {format(
                selectedDate,
                "EEEE d 'de' MMMM",
                {
                  locale: es,
                },
              )}
            </p>

            <p className="text-sm text-slate-500">
              Horarios disponibles y reservas
            </p>
          </div>

          <label className="relative flex h-11 shrink-0 cursor-pointer items-center rounded-lg border px-3 text-sm font-medium">
            📅
            <span className="ml-2 hidden sm:inline">
              Elegir fecha
            </span>

            <input
              type="date"
              value={format(
                selectedDate,
                "yyyy-MM-dd",
              )}
              onChange={handleDateChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Elegir fecha"
            />
          </label>
        </div>

        {selectedDay ? (
          <DailyCalendar
            day={selectedDay}
            onCellClick={(cell: CalendarCell) => {
              if (cell.status === "available") {
                setActionCell(cell);
                return;
              }

              if (cell.status === "blocked") {
                setSelectedBlockCell(cell);
                return;
              }

              if (
                cell.status === "reserved" ||
                cell.status === "pending_payment"
              ) {
                setSelectedCell(cell);
              }
            }}
          />
        ) : (
          <EmptyState
            title="No hay datos para este día"
            description="No fue posible cargar los horarios."
          />
        )}
      </div>

      {/* ACCIONES */}

      {actionCell && (
        <Modal
          open={true}
          onClose={() => setActionCell(null)}
          title="¿Qué querés hacer?"
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCell(actionCell);
                setActionCell(null);
              }}
              className="w-full rounded-lg border px-4 py-3 text-left font-medium hover:bg-slate-50"
            >
              Nueva reserva
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedBlockCell(actionCell);
                setActionCell(null);
              }}
              className="w-full rounded-lg border px-4 py-3 text-left font-medium hover:bg-slate-50"
            >
              Bloquear horario
            </button>
          </div>
        </Modal>
      )}

      {/* RESERVA */}

      {selectedCell && (
        <ReservationModal
          open={selectedCell !== null}
          cell={selectedCell}
          resourceId={selectedResourceId!}
          onClose={() => setSelectedCell(null)}
          onSubmit={handleCreateReservation}
          onUpdated={handleReservationUpdated}
        />
      )}

      {/* BLOQUEO */}

      {selectedBlockCell && (
        <ResourceBlockModal
          open={selectedBlockCell !== null}
          cell={selectedBlockCell}
          resourceId={selectedResourceId!}
          onClose={() => setSelectedBlockCell(null)}
          onCreated={refresh}
        />
      )}
    </Page>
  );
}