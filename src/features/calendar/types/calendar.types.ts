export interface CalendarColumn {

  date: string;

  day: string;

  isToday: boolean;

}

export interface CalendarRow {

  hour: string;

}

export interface CalendarGrid {

  columns: CalendarColumn[];

  rows: CalendarRow[];

}