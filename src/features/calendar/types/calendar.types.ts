export type CalendarCellStatus =
  | "available"
  | "reserved"
  | "pending_payment"
  | "closed"
  | "blocked";

export interface CalendarCell {
  hour: string;
  starts_at: string;
  ends_at: string;
  status: CalendarCellStatus;
  clickable: boolean;

  reservationId?: string;
  reservationIds?: string[];
  reservationNames?: string[];

  resourceBlockId?: string;

  isGym?: boolean;
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