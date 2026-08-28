import { useEffect, useState } from "react";

import { calendarService } from "../services/calendar.service";

import type { CalendarWeek } from "../types/calendar.types";

export function useCalendar(
  resourceId: string | undefined,
  weekStart: Date,
) {
  const [week, setWeek] = useState<CalendarWeek>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!resourceId) {
      setWeek(undefined);
      return;
    }

    const id: string = resourceId;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await calendarService.getWeek(
          id,
          weekStart,
        );

        setWeek(data);
      } catch (error) {
        console.error(
          "Error cargando calendario:",
          error,
        );

        setError(
          error instanceof Error
            ? error
            : new Error(
                "No se pudo cargar el calendario.",
              ),
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [resourceId, weekStart]);

  async function refresh() {
    if (!resourceId) return;

    const id = resourceId;

    setLoading(true);
    setError(null);

    try {
      const data = await calendarService.getWeek(
        id,
        weekStart,
      );

      setWeek(data);
    } catch (error) {
      console.error(
        "Error actualizando calendario:",
        error,
      );

      setError(
        error instanceof Error
          ? error
          : new Error(
              "No se pudo actualizar el calendario.",
            ),
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    week,
    loading,
    error,
    refresh,
  };
}