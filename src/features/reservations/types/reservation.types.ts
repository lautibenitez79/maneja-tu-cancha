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

export type AttendanceStatus =
  | "attended"
  | "no_show";

export type BalancePaymentMethod =
  | "cash"
  | "mercado_pago"
  | "transfer";

export interface Reservation {
  id: string;
  club_id: string;
  resource_id: string;

  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;

  starts_at: string;
  ends_at: string;

  amount_paid: number;
  total_amount: number;
  deposit_amount: number;

  status: ReservationStatus;
  source: ReservationSource;

  payment_id: string | null;
  payment_status: PaymentStatus;

  notes: string | null;

  reminder_sent_at: string | null;

  gym_monthly_fee_id: string | null;

  created_at: string;
  updated_at: string;

  // Seguimiento de asistencia
  attendance_status: AttendanceStatus | null;
  no_show_reason: string | null;
  no_show_message_sent_at: string | null;

  // Seguimiento del saldo
  balance_paid_amount: number;
  balance_payment_method: BalancePaymentMethod | null;
  balance_payment_proof_url: string | null;
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