import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { resourceService } from "@/features/resources/services/resource.service";
import { workingHoursService } from "@/features/resources/services/working-hours.service";

import type { DashboardStats } from "../types/dashboard.types";

export function useDashboard() {
  const { profile } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats>({
      resources: 0,
      hasWorkingHours: false,
      reservations: 0,
      employees: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function load() {

      if (!profile?.club_id) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);

        const resources =
          await resourceService.list(
            profile.club_id
          );

        const workingHours =
          await Promise.all(
            resources.map(resource =>
              workingHoursService.list(
                resource.id
              )
            )
          );

        const hasWorkingHours =
          workingHours.some(days =>
            days.some(day => day.enabled)
          );

        setStats({

          resources: resources.length,

          hasWorkingHours,

          reservations: 0,

          employees: 0,

        });

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, [profile]);

  return {
    stats,
    loading,
  };
}