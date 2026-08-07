import { useState } from "react";

import Page from "@/components/ui/Page";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

import { useCalendar } from "../hooks/useCalendar";
import WeeklyCalendar from "../components/WeeklyCalendar";
import { useResources } from "@/features/resources/hooks/useResources";
import type {
  CalendarCell,
} from "../types/calendar.types";

export default function CalendarPage() {

    const {

        resources,

        loading: loadingResources,

    } = useResources();

  const [

    weekStart,

  ] = useState(

    new Date(),

  );

  const [

  selectedCell,

  setSelectedCell,

] = useState<CalendarCell | null>(null);

const resourceId =

  resources[0]?.id;

const {

  week,

  loading,

} = useCalendar(

  resourceId ?? "",

  weekStart,

);

if (

    loading ||

    loadingResources

    ) {

  return <Loading />;

}

if (

  resources.length === 0

) {

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

    <Page

      title="Calendario"

      subtitle="Reservas semanales"

    >

    <WeeklyCalendar

    week={week}

    onCellClick={setSelectedCell}

    />

    {

        selectedCell && (

            <pre className="mt-6 rounded-xl bg-slate-100 p-4">

            {JSON.stringify(

                selectedCell,

                null,

                2,

            )}

            </pre>

        )

        }

    </Page>

  );

}