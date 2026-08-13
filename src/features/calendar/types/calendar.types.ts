export type CalendarCellStatus =
  | "available"
  | "reserved"
  | "pending_payment"
  | "closed";

export interface CalendarCell {

  hour: string;

  starts_at: string;

  ends_at: string;

  status:
    | "available"
    | "reserved"
    | "pending_payment"
    | "closed";

  clickable: boolean;

  reservationId?: string;

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