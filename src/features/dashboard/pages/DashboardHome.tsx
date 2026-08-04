import DashboardHeader from "../components/DashboardHeader";
import WelcomeCard from "../widgets/WelcomeCard";
import StatsCards from "../widgets/StatsCards";
import SetupChecklist from "../widgets/SetupChecklist";

import { useDashboard } from "../hooks/useDashboard";
import Loading from "@/components/ui/Loading";

export default function DashboardHome() {
  const {
  stats,
  loading,
} = useDashboard();

if (loading) {
  return <Loading />;
}

  return (
    <div className="space-y-8">

      <DashboardHeader />

      <StatsCards stats={stats} />

      <WelcomeCard />

      <SetupChecklist
        hasResources={stats.resources > 0}
        hasWorkingHours={stats.hasWorkingHours}
      />

    </div>
  );
}