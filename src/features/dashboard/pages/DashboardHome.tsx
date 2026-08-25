import DashboardHeader from "../components/DashboardHeader";

import WelcomeCard from "../widgets/WelcomeCard";
import StatsCards from "../widgets/StatsCards";
import SetupChecklist from "../widgets/SetupChecklist";
import TodayReservations from "../widgets/TodayReservations";

import { useDashboard } from "../hooks/useDashboard";

import MercadoPagoConnectionCard from "@/features/mercadopago/components/MercadoPagoConnectionCard";
import { useAuth } from "@/hooks/useAuth";

import Loading from "@/components/ui/Loading";
import Page from "@/components/ui/Page/index";

export default function DashboardHome() {
  const {
    stats,
    todayReservations,
    loading,
    timezone,
  } = useDashboard();

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

      <TodayReservations
        reservations={todayReservations}
        timezone={timezone}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WelcomeCard />

        <MercadoPagoConnectionCard
          clubId={profile.club_id}
        />
      </div>

      <SetupChecklist
        hasResources={stats.resources > 0}
        hasWorkingHours={stats.hasWorkingHours}
      />
    </Page>
  );
}