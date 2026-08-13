import {
  useEffect,
  useState,
} from "react";

import {
  calendarService,
} from "../services/calendar.service";

import type {
  CalendarWeek,
} from "../types/calendar.types";

export function useCalendar(
  resourceId: string | undefined,
  weekStart: Date,
) {

  const [
    week,
    setWeek,
  ] = useState<CalendarWeek>();

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {

    if (!resourceId) {

      setWeek(undefined);

      return;

    }

    async function load() {

      setLoading(true);

      try {

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

    load();

  }, [
    resourceId,
    weekStart,
  ]);

  async function refresh() {

    if (!resourceId) return;

    setLoading(true);

    try {

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

  return {
    week,
    loading,
    refresh,
  };

}