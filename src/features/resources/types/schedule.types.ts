export interface TimeRange {

  start: number | null;

  end: number | null;

}

export interface DaySchedule {

  primary: TimeRange;

  secondary: TimeRange;

}