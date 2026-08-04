import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";

import CreateClubWizard
from "@/features/clubs/components/CreateClubWizard";
import Loading from "@/components/ui/Loading";

interface Props {
  children: ReactNode;
}

export default function DashboardGate({
  children,
}: Props) {

  const {
    loading,
    profile,
  } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!profile?.club_id) {
    return <CreateClubWizard />;
  }

  return <>{children}</>;
}