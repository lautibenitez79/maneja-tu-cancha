import { useMemo } from "react";

import {

  addDays,

  format,

  isToday,

} from "date-fns";

import { es } from "date-fns/locale";

export function useWeeklyCalendar(

  weekStart: Date,

) {

  return useMemo(() => {

    const columns = [];

    for (

      let i = 0;

      i < 7;

      i++

    ) {

      const date =

        addDays(

          weekStart,

          i,

        );

      columns.push({

        date:

          format(

            date,

            "yyyy-MM-dd",

          ),

        day:

          format(

            date,

            "EEE dd",

            {

              locale: es,

            },

          ),

        isToday:

          isToday(date),

      });

    }

    const rows = [];

    for (

      let h = 0;

      h < 24;

      h++

    ) {

      rows.push({

        hour:

          `${String(h).padStart(2,"0")}:00`,

      });

    }

    return {

      columns,

      rows,

    };

  }, [weekStart]);

}