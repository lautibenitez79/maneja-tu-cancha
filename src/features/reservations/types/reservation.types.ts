export type ReservationStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "refunded"
  | "not_required";

export type ReservationSource =
  | "web"
  | "admin";

export interface Reservation {
  id: string;

  club_id: string;
  resource_id: string;

  customer_name: string;
  customer_phone: string;
  customer_email: string;

  starts_at: string;
  ends_at: string;

  amount_paid: number;

  status: ReservationStatus;

  payment_status: PaymentStatus;

  source: ReservationSource;

  payment_id: string | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateReservationForm {

  resource_id: string;

  customer_name: string;

  customer_phone: string;

  customer_email: string;

  starts_at: string;

  ends_at: string;

  amount_paid: number;

  source: ReservationSource;

  notes: string;

  recurring?: RecurringReservationOptions;

}

export interface UpdateReservationForm {

  customer_name?: string;

  customer_phone?: string;

  customer_email?: string;

  starts_at?: string;

  ends_at?: string;

  amount_paid?: number;

  status?: ReservationStatus;

}

export interface RecurringReservationOptions {
  days_of_week: number[];
  starts_on: string;
  ends_on: string;
}