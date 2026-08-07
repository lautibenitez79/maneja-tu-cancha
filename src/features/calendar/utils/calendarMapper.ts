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
    days: week.days.map(day => ({
      date: day.date,
      title: "",
      isToday: false,
      cells: day.slots.map(slot => ({
        hour: slot.starts_at.substring(11, 16),
        status: slot.status,
        clickable: slot.clickable,
        reservationId: slot.reservationId,
      })),
    })),
  };

}