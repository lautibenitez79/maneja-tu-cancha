import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { dashboardService } from "../services/dashboard.service";

import type {
  DashboardAnalytics,
  DashboardPeriod,
} from "../types/dashboard.types";

export function useDashboardAnalytics(
  period: DashboardPeriod,
) {
  const { profile } = useAuth();

  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      if (!profile?.club_id) {
        setAnalytics(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await dashboardService.getAnalytics(
            profile.club_id,
            period,
          );

        setAnalytics(data);
      } catch (error) {
        console.error(
          "Error cargando métricas:",
          error,
        );

        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile?.club_id, period]);

  return {
    analytics,
    loading,
  };
}