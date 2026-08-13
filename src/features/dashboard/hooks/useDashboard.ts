import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { resourceService } from "@/features/resources/services/resource.service";
import { workingHoursService } from "@/features/resources/services/working-hours.service";
import { reservationService } from "@/features/reservations/services/reservation.service";
import { clubService } from "@/features/clubs/services/club.service";

import type { DashboardReservation, DashboardStats } from "../types/dashboard.types";

import type { Resource } from "@/features/resources/types/resource.types";

function getTodayInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export function useDashboard() {
  const { profile } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    resources: 0,
    hasWorkingHours: false,
    reservations: 0,
    income: 0,
    pendingPayments: 0,
    employees: 0,
  });

  const [todayReservations, setTodayReservations] =
    useState<DashboardReservation[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile?.club_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // -----------------------------------------
        // CLUB
        // -----------------------------------------

        const club = await clubService.getClub(
          profile.club_id,
        );

        if (!club) {
          throw new Error("No se encontró el complejo.");
        }

        // -----------------------------------------
        // RECURSOS
        // -----------------------------------------

        const resources =
          await resourceService.list(
            profile.club_id,
          );

        // -----------------------------------------
        // HORARIOS
        // -----------------------------------------

        const workingHours =
          await Promise.all(
            resources.map((resource) =>
              workingHoursService.list(
                resource.id,
              ),
            ),
          );

        const hasWorkingHours =
          workingHours.some((days) =>
            days.some(
              (day) => day.enabled,
            ),
          );

        // -----------------------------------------
        // FECHA DE HOY
        // -----------------------------------------

        const today = getTodayInTimezone(
          club.timezone,
        );

        // -----------------------------------------
        // RESERVAS DE TODAS LAS CANCHAS
        // -----------------------------------------

        const reservationsByResource =
          await Promise.all(
            resources.map((resource) =>
              reservationService.listByDay(
                resource.id,
                today,
              ),
            ),
          );

        const reservations =
          reservationsByResource.flat();

        // -----------------------------------------
        // RESERVAS ACTIVAS
        // -----------------------------------------

        const activeReservations =
          reservations.filter(
            (reservation) =>
              reservation.status !==
              "cancelled",
          );

        // -----------------------------------------
        // PENDIENTES DE PAGO
        // -----------------------------------------

        const pendingPayments =
          activeReservations.filter(
            (reservation) =>
              reservation.status ===
              "pending_payment",
          );

        // -----------------------------------------
        // INGRESOS
        // -----------------------------------------

        const income =
          activeReservations.reduce(
            (total, reservation) =>
              total +
              Number(
                reservation.amount_paid ?? 0,
              ),
            0,
          );

        // -----------------------------------------
        // MAPA DE RECURSOS
        // -----------------------------------------

        const resourceMap =
          new Map<string, Resource>();

        resources.forEach((resource) => {
          resourceMap.set(
            resource.id,
            resource,
          );
        });

        // -----------------------------------------
        // RESERVAS PARA EL DASHBOARD
        // -----------------------------------------

        const dashboardReservations =
          [...activeReservations]
            .sort(
              (a, b) =>
                new Date(
                  a.starts_at,
                ).getTime() -
                new Date(
                  b.starts_at,
                ).getTime(),
            )
            .map(
              (
                reservation,
              ): DashboardReservation => ({
                ...reservation,

                resourceName:
                  resourceMap.get(
                    reservation.resource_id,
                  )?.name ??
                  "Cancha",
              }),
            );

        setTodayReservations(
          dashboardReservations,
        );

        // -----------------------------------------
        // ESTADÍSTICAS
        // -----------------------------------------

        setStats({
          resources: resources.length,

          hasWorkingHours,

          reservations:
            activeReservations.length,

          income,

          pendingPayments:
            pendingPayments.length,

          employees: 0,
        });
      } catch (error) {
        console.error(
          "Error cargando dashboard:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile]);

  return {
    stats,
    todayReservations,
    loading,
  };
}