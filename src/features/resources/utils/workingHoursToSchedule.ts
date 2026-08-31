import type {
  WorkingHour,
} from "@/features/resources/types/working-hours.types";

import type {
  DaySchedule,
} from "../types/schedule.types";

import { createEmptyWeek } from "./createEmptyWeek";
import {
  TIME_SLOTS,
  END_TIME,
} from "./timeSlots";

export function workingHoursToSchedule(
  hours: WorkingHour[],
): DaySchedule[] {
  const week = createEmptyWeek();

  hours.forEach((hour) => {
    const opensAt = normalizeTime(hour.opens_at);
    const closesAt = normalizeTime(hour.closes_at);
    const reopensAt = normalizeTime(hour.reopens_at);
    const finalClosesAt = normalizeTime(hour.final_closes_at);

    const isFullDay =
      opensAt === "00:00" &&
      closesAt === "00:00";

    const isUntilMidnight =
      closesAt === "00:00" &&
      opensAt !== "00:00";

    const openIndex =
      opensAt !== null
        ? TIME_SLOTS.indexOf(opensAt)
        : -1;

    const closeIndex =
      closesAt !== null
        ? TIME_SLOTS.indexOf(closesAt)
        : -1;

    const reopenIndex =
      reopensAt !== null
        ? TIME_SLOTS.indexOf(reopensAt)
        : -1;

    const finalCloseIndex =
      finalClosesAt !== null
        ? TIME_SLOTS.indexOf(finalClosesAt)
        : -1;

    week[hour.day_of_week] = {
      primary: {
        start:
          openIndex >= 0
            ? openIndex
            : null,

        end:
          isFullDay || isUntilMidnight
            ? END_TIME
            : closeIndex >= 0
              ? closeIndex
              : null,
      },

      secondary: {
        start:
          reopenIndex >= 0
            ? reopenIndex
            : null,

        end:
          finalClosesAt === "00:00"
            ? END_TIME
            : finalCloseIndex >= 0
              ? finalCloseIndex
              : null,
      },
    };
  });

  return week;
}

function normalizeTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.substring(0, 5);
}