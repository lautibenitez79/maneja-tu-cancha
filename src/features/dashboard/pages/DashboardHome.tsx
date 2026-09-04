import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import DashboardHeader from "../components/DashboardHeader";
import WelcomeCard from "../widgets/WelcomeCard";
import StatsCards from "../widgets/StatsCards";
import SetupChecklist from "../widgets/SetupChecklist";
import TodayReservations from "../widgets/TodayReservations";

import PeriodSelector from "../components/PeriodSelector";
import OccupancyCard from "../widgets/OccupancyCard";
import PeriodComparison from "../widgets/PeriodComparison";
import PopularHours from "../widgets/PopularHours";
import RevenueChart from "../widgets/RevenueChart";

import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import { useDashboard } from "../hooks/useDashboard";

import MercadoPagoConnectionCard from "@/features/mercadopago/components/MercadoPagoConnectionCard";

import type { DashboardPeriod } from "../types/dashboard.types";

import Loading from "@/components/ui/Loading";
import Page from "@/components/ui/Page/index";

export default function DashboardHome() {
  const {
    stats,
    todayReservations,
    loading,
    timezone,
  } = useDashboard();

  const [period, setPeriod] =
    useState<DashboardPeriod>("week");

  const {
    analytics,
    loading: loadingAnalytics,
  } = useDashboardAnalytics(period);

  const { profile } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!profile?.club_id) {
    return (
      <Page title="Dashboard">
        <DashboardHeader />

        <div className="rounded-xl border p-6">
          No se encontró el complejo asociado a tu cuenta.
        </div>
      </Page>
    );
  }

  return (
    <Page title="Dashboard">
      <DashboardHeader />

      <StatsCards stats={stats} />

      {/* MÉTRICAS */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-title)]">
            Métricas
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text)]">
            Analizá el rendimiento de tu complejo.
          </p>
        </div>

        <PeriodSelector
          value={period}
          onChange={setPeriod}
        />
      </div>

      {loadingAnalytics || !analytics ? (
        <div className="rounded-xl border bg-[var(--color-card)] p-6">
          Cargando métricas...
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <OccupancyCard
              occupancy={analytics.occupancy}
            />

            <PeriodComparison
              reservations={
                analytics.reservations
              }
              revenue={analytics.revenue}
              occupancy={
                analytics.occupancyComparison
              }
            />
          </div>

          <RevenueChart
            data={analytics.revenueByDay}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <PopularHours
              hours={analytics.popularHours}
            />
          </div>
        </>
      )}

      {/* RESERVAS DE HOY */}

      <TodayReservations
        reservations={todayReservations}
        timezone={timezone}
      />

      {/* CONEXIONES / CONFIGURACIÓN */}

      <div
        className={
          profile.role === "admin"
            ? "grid gap-6 lg:grid-cols-2"
            : "grid gap-6"
        }
      >
        <WelcomeCard />

        {profile.role === "admin" && (
          <MercadoPagoConnectionCard
            clubId={profile.club_id}
          />
        )}
      </div>

      <SetupChecklist
        hasResources={stats.resources > 0}
        hasWorkingHours={stats.hasWorkingHours}
      />
    </Page>
  );
}