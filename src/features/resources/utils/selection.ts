import type {
  TimeRange,
} from "../types/schedule.types";

export function updateRange(

  range: TimeRange,

  click: number,

): TimeRange {

  if (range.start === null) {

    return {

      start: click,

      end: null,

    };

  }

  if (range.end === null) {

    if (click < range.start) {

      return {

        start: click,

        end: range.start,

      };

    }

    return {

      start: range.start,

      end: click,

    };

  }

  return {

    start: click,

    end: null,

  };

}