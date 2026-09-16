import type {
  AttendanceStatus,
  BalancePaymentMethod,
  Reservation,
} from "./reservation.types";

export type ReservationAttendanceFilter =
  | "all"
  | "pending"
  | "attended"
  | "no_show";

export interface ReservationTracking extends Reservation {
  resource?: {
    name: string;
    type: string;
  } | null;
}

export interface ReservationTrackingFilters {
  clubId: string;
  date: string;
  attendance: ReservationAttendanceFilter;
}

export interface ReservationPaymentSummary {
  reservations: number;
  attended: number;
  noShow: number;
  pendingAttendance: number;

  reservationPayments: number;
  totalPayments: number;

  cash: number;
  mercadoPago: number;
  transfer: number;

  pendingCollection: number;
}

export interface UpdateAttendancePayload {
  reservationId: string;
  attendanceStatus: AttendanceStatus;
  noShowReason?: string | null;
}

export interface UpdateBalancePaymentPayload {
  reservationId: string;
  balancePaidAmount: number;
  paymentMethod: BalancePaymentMethod | null;
}

export interface UploadReservationProofPayload {
  reservationId: string;
  clubId: string;
  file: File;
}