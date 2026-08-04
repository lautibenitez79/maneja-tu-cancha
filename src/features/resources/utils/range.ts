import type {
  TimeRange,
} from "../types/schedule.types";

export function rangeToIndexes(

  range: TimeRange

) {

  if (

    range.start === null ||

    range.end === null

  ) {

    return [];

  }

  return Array.from(

    {

      length:

        range.end -

        range.start +

        1,

    },

    (_, i) =>

      range.start! + i

  );

}