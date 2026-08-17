import {
  isToday,
  parseISO,
  format,
} from "date-fns";

import { es } from "date-fns/locale";

import type {
  AvailabilityWeek,
} from "@/features/reservations/types/availability.types";

import type {
  CalendarWeek,
} from "../types/calendar.types";

export function mapAvailabilityToCalendar(
  week: AvailabilityWeek,
): CalendarWeek {
  return {
    days: week.days.map((day) => {
      const date =
        parseISO(day.date);

      return {
        date: day.date,

        title:
          format(
            date,
            "EEEE dd-MM",
            {
              locale: es,
            },
          ),

        isToday:
          isToday(date),

        cells: day.slots.map((slot) => ({
        hour:
          `${slot.starts_at.substring(
            11,
            16,
          )} - ${slot.ends_at.substring(
            11,
            16,
          )}`,

        starts_at:
          slot.starts_at,

        ends_at:
          slot.ends_at,

        status:
          slot.status,

        clickable:
          slot.clickable,

        reservationId:
          slot.reservationId,

        resourceBlockId:
          slot.resourceBlockId,
      })),
      };
    }),
  };
}