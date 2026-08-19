export type AvailabilityStatus =
    | "available"
    | "reserved"
    | "pending_payment"
    | "closed"
    | "blocked";

export interface AvailabilityDay {

  date: string;

  slots: AvailabilitySlot[];

}

export interface AvailabilityWeek {

  resourceId: string;

  weekStart: string;

  days: AvailabilityDay[];

}

export interface AvailabilitySlot {
  starts_at: string;
  ends_at: string;
  status: AvailabilityStatus;
  clickable: boolean;
  reservationId?: string;
  resourceBlockId?: string;
}