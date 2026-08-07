export type CalendarCellStatus =
  | "available"
  | "reserved"
  | "pending_payment"
  | "closed";

export interface CalendarCell {

  hour: string;

  status: CalendarCellStatus;

  reservationId?: string;

  clickable: boolean;

}

export interface CalendarDay {

  date: string;

  title: string;

  isToday: boolean;

  cells: CalendarCell[];

}

export interface CalendarWeek {

  days: CalendarDay[];

}