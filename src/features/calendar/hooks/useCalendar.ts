import { useEffect, useState } from "react";

import { calendarService } from "../services/calendar.service";

import type {
  CalendarWeek,
} from "../types/calendar.types";

export function useCalendar(
  resourceId: string,
  weekStart: Date,
) {

  const [week, setWeek] =
    useState<CalendarWeek>();

  const [loading, setLoading] =
    useState(true);

  async function refresh() {

    if (!resourceId) {
      setWeek(undefined);
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const data =
        await calendarService.getWeek(
          resourceId,
          weekStart,
        );

      setWeek(data);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {
    refresh();
  }, [resourceId, weekStart]);

  return {
    week,
    loading,
    refresh,
  };

}