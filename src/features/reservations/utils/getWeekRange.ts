import {
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";

export function getWeekRange(
  date: Date,
) {

  const start =
    startOfWeek(
      date,
      { weekStartsOn: 1 },
    );

  const end =
    endOfWeek(
      date,
      { weekStartsOn: 1 },
    );

  return {

    start:

      format(
        start,
        "yyyy-MM-dd'T'00:00:00",
      ),

    end:

      format(
        end,
        "yyyy-MM-dd'T'23:59:59",
      ),

  };

}