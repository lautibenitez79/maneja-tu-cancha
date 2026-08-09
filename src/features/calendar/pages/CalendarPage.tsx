import { useState } from "react";

import Page from "@/components/ui/Page";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

import { useCalendar } from "../hooks/useCalendar";
import WeeklyCalendar from "../components/WeeklyCalendar";
import { useResources } from "@/features/resources/hooks/useResources";
import type { CalendarCell } from "../types/calendar.types";
import ReservationModal from "@/features/reservations/components/ReservationModal";

export default function CalendarPage() {
  const {
    resources,

    loading: loadingResources,
  } = useResources();

  const [weekStart] = useState(new Date());

  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);

  const resourceId = resources[0]?.id;

  const {
    week,
    loading,
    refresh,
  } = useCalendar(
    resourceId!,
    weekStart,
  );

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
      <WeeklyCalendar week={week} onCellClick={setSelectedCell} />

      {selectedCell && (
        <ReservationModal
        open={selectedCell !== null}
        cell={selectedCell}
        onClose={() => setSelectedCell(null)}
      />
            )}
    </Page>
  );
}
