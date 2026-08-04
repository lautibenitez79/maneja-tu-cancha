import type { DaySchedule } from "../types/schedule.types";
import type { WorkingHourForm } from "../types/working-hours.types";

import { scheduleToWorkingHours } from "./scheduleMapper";

export function weekToWorkingHours(
  week: DaySchedule[],
): WorkingHourForm[] {
  return week.map((day, index) => {
    const schedule =
      scheduleToWorkingHours(day);

    return {
      day_of_week: index,

      enabled:
        schedule.opens_at !== null &&
        schedule.closes_at !== null,

      opens_at:
        schedule.opens_at ?? "08:00",

      closes_at:
        schedule.closes_at ?? "22:00",

      reopens_at:
        schedule.reopens_at,

      final_closes_at:
        schedule.final_closes_at,
    };
  });
}