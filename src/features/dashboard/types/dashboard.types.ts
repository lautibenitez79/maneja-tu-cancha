import type { Reservation } from "@/features/reservations/types/reservation.types";

export interface DashboardStats {
  resources: number;
  hasWorkingHours: boolean;
  reservations: number;
  income: number;
  pendingPayments: number;
  employees: number;
}

export interface DashboardReservation
  extends Reservation {
  resourceName: string;
}