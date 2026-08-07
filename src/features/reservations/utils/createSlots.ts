import { addMinutes, format } from "date-fns";

import { TIME_SLOTS }
from "@/features/resources/utils/timeSlots";

export interface Slot {

  starts_at: string;

  ends_at: string;

}

export function createSlots(

  duration: number,

): Slot[] {

  return TIME_SLOTS.map(hour => {

    const [h, m] =

      hour.split(":").map(Number);

    const start =

      new Date();

    start.setHours(

        h,

        m,

        0,

        0,

    );

    const end =

      addMinutes(

        start,

        duration,

      );

    return {

      starts_at: hour,

      ends_at: format(

        end,

        "HH:mm",

      ),

    };

  });

}