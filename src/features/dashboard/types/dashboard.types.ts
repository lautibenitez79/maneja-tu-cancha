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

export type DashboardPeriod =
  | "today"
  | "week"
  | "month";

export interface DashboardMetric {
  value: number;
  previousValue: number;
  percentage: number;
}

export interface DashboardOccupancy {
  occupied: number;
  available: number;
  percentage: number;
}

export interface DashboardRevenuePoint {
  label: string;
  value: number;
}

export interface DashboardHourPoint {
  hour: string;
  reservations: number;
}

export interface DashboardAnalytics {
  period: DashboardPeriod;

  occupancy: DashboardOccupancy;

  revenue: DashboardMetric;

  reservations: DashboardMetric;

  occupancyComparison: DashboardMetric;

  revenueByDay: DashboardRevenuePoint[];

  popularHours: DashboardHourPoint[];
}