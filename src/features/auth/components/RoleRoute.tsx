import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/ui/Loading";

interface Props {
  allowedRoles: Array<"admin" | "user">;
  children: ReactNode;
}

export default function RoleRoute({
  allowedRoles,
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
    return <Navigate to="/dashboard" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}