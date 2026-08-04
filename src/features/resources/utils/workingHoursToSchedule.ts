import type {

  WorkingHour,

} from "../types/working-hours.types";

import type {

  DaySchedule,

} from "../types/schedule.types";

import { createEmptyWeek }
from "./createEmptyWeek";

import { TIME_SLOTS }
from "./timeSlots";

export function workingHoursToSchedule(

  hours: WorkingHour[]

): DaySchedule[] {

  const week = createEmptyWeek();

  hours.forEach(hour => {

    week[hour.day_of_week] = {

      primary: {

        start:
          TIME_SLOTS.indexOf(
            hour.opens_at
          ),

        end:
          TIME_SLOTS.indexOf(
            hour.closes_at
          ),

      },

      secondary: {

        start:
          hour.reopens_at
            ? TIME_SLOTS.indexOf(
                hour.reopens_at
              )
            : null,

        end:
          hour.final_closes_at
            ? TIME_SLOTS.indexOf(
                hour.final_closes_at
              )
            : null,

      },

    };

  });

  return week;

}