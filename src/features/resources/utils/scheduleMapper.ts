import { TIME_SLOTS, END_TIME } from "./timeSlots";

import type {
  DaySchedule,
} from "../types/schedule.types";

export function scheduleToWorkingHours(
  schedule: DaySchedule,
) {
  const isFullDay =
    schedule.primary.start === 0 &&
    schedule.primary.end === END_TIME;

  const primaryClose =
    schedule.primary.end === END_TIME
      ? "00:00"
      : schedule.primary.end === null
        ? null
        : TIME_SLOTS[
            schedule.primary.end
          ];

  const secondaryClose =
    schedule.secondary.end === END_TIME
      ? "00:00"
      : schedule.secondary.end === null
        ? null
        : TIME_SLOTS[
            schedule.secondary.end
          ];

  return {
    opens_at:
      schedule.primary.start === null
        ? null
        : TIME_SLOTS[
            schedule.primary.start
          ],

    closes_at:
      schedule.primary.end === null
        ? null
        : isFullDay
          ? "00:00"
          : primaryClose,

    reopens_at:
      schedule.secondary.start === null
        ? null
        : TIME_SLOTS[
            schedule.secondary.start
          ],

    final_closes_at:
      schedule.secondary.end === null
        ? null
        : secondaryClose,
  };
}