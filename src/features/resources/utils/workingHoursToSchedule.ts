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
    const isFullDay =
      hour.opens_at === "00:00" &&
      hour.closes_at === "00:00";

    const isUntilMidnight =
      hour.closes_at === "00:00" &&
      hour.opens_at !== "00:00";

    week[hour.day_of_week] = {
      primary: {
        start:
          TIME_SLOTS.indexOf(
            hour.opens_at,
          ),

        end:
          isFullDay || isUntilMidnight
            ? END_TIME
            : TIME_SLOTS.indexOf(
                hour.closes_at,
              ),
      },

      secondary: {
        start:
          hour.reopens_at
            ? TIME_SLOTS.indexOf(
                hour.reopens_at,
              )
            : null,

        end:
          hour.final_closes_at
            ? hour.final_closes_at ===
              "00:00"
              ? END_TIME
              : TIME_SLOTS.indexOf(
                  hour.final_closes_at,
                )
            : null,
      },
    };
  });

  return week;
}