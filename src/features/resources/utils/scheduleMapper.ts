import { TIME_SLOTS }
from "./timeSlots";

import type {
  DaySchedule,
} from "../types/schedule.types";

export function scheduleToWorkingHours(

  schedule: DaySchedule

) {

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
        : TIME_SLOTS[
            schedule.primary.end
          ],

    reopens_at:

      schedule.secondary.start === null
        ? null
        : TIME_SLOTS[
            schedule.secondary.start
          ],

    final_closes_at:

      schedule.secondary.end === null
        ? null
        : TIME_SLOTS[
            schedule.secondary.end
          ],

  };

}