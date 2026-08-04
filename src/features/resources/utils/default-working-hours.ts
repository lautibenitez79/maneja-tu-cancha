import type { WorkingHourForm } from "../types/working-hours.types";

export const defaultWorkingHours: WorkingHourForm[] =
  Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,

    enabled: false,

    opens_at: "08:00",

    closes_at: "22:00",

    reopens_at: null,

    final_closes_at: null,
  }));