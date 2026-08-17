import { useEffect, useState } from "react";

import { startOfWeek, addWeeks } from "date-fns";
import { toast } from "sonner";

import Page from "@/components/ui/Page";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";

import { useCalendar } from "../hooks/useCalendar";
import WeeklyCalendar from "../components/WeeklyCalendar";

import { useResources } from "@/features/resources/hooks/useResources";

import type { CalendarCell } from "../types/calendar.types";

import ReservationModal from "@/features/reservations/components/ReservationModal";
import ResourceBlockModal from "@/features/reservations/components/ResourceBlockModal";

import { reservationService } from "@/features/reservations/services/reservation.service";

import type { CreateReservationForm } from "@/features/reservations/types/reservation.types";

import { clubService } from "@/features/clubs/services/club.service";
import { localDateTimeToUtc } from "@/utils/timezone";

import { useAuth } from "@/hooks/useAuth";

export default function CalendarPage() {
  const { profile } = useAuth();

  const { resources, loading: loadingResources } = useResources();

  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  );

  const [selectedBlockCell, setSelectedBlockCell] =
    useState<CalendarCell | null>(null);

  const [actionCell, setActionCell] = useState<CalendarCell | null>(null);

  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);

  const [selectedResourceId, setSelectedResourceId] = useState<string>();

  const { week, loading, refresh } = useCalendar(selectedResourceId, weekStart);

  useEffect(() => {
    if (resources.length > 0 && !selectedResourceId) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  async function handleCreateReservation(values: CreateReservationForm) {
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

      await reservationService.create(profile.club_id, {
        ...values,

        starts_at: localDateTimeToUtc(values.starts_at, club.timezone),

        ends_at: localDateTimeToUtc(values.ends_at, club.timezone),
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
    setWeekStart(
      startOfWeek(new Date(), {
        weekStartsOn: 1,
      }),
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
    <Page title="Calendario" subtitle="Reservas semanales">
      {/* CANCHA */}

      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="resource" className="text-sm font-medium">
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
          className="rounded-lg border bg-[var(--color-card)] px-3 py-2"
        >
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
      </div>

      {/* SEMANAS */}

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

      {/* CALENDARIO */}

      <WeeklyCalendar
        week={week}
        onCellClick={(cell) => {
        if (
          cell.status === "closed" &&
          cell.resourceBlockId
        ) {
          setSelectedBlockCell(cell);
          return;
        }

        if (cell.status === "available") {
          setActionCell(cell);
          return;
        }

        setSelectedCell(cell);
      }}
      />

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
