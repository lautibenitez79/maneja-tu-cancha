import type { DaySchedule } from "../types/schedule.types";

const emptyDay: DaySchedule = {

  primary: {

    start: null,

    end: null,

  },

  secondary: {

    start: null,

    end: null,

  },

};

export function createEmptyWeek() {

  return Array.from(

    { length: 7 },

    () => structuredClone(emptyDay)

  );

}