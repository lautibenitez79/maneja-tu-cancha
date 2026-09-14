import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

import CreateClubWizard from "@/features/clubs/components/CreateClubWizard";
import Loading from "@/components/ui/Loading";

interface Props {
  children: ReactNode;
}

interface SaasSubscription {
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  trial_ends_at: string | null;
  current_period_end: string | null;
  access_type: "paid" | "complimentary";
  access_until: string | null;
}

function hasSubscriptionAccess(
  subscription: SaasSubscription | null,
): boolean {
  if (!subscription) {
    return false;
  }

  const now = Date.now();

  if (subscription.access_type === "complimentary") {
    if (!subscription.access_until) {
      return subscription.status === "active";
    }

    return (
      subscription.status === "active" &&
      new Date(subscription.access_until).getTime() > now
    );
  }

  if (subscription.status === "trialing") {
    if (!subscription.trial_ends_at) {
      return false;
    }

    return new Date(subscription.trial_ends_at).getTime() > now;
  }

  if (subscription.status === "active") {
    if (!subscription.current_period_end) {
      return false;
    }

    return new Date(subscription.current_period_end).getTime() > now;
  }

  return false;
}

export default function DashboardGate({
  children,
}: Props) {
  const { loading, profile } = useAuth();

  const location = useLocation();

  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const checkedClubIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!profile?.club_id) {
      setSubscriptionLoading(false);
      checkedClubIdRef.current = null;
      return;
    }

    const clubId = profile.club_id;

    async function checkSubscription() {
      const isFirstCheckForClub =
        checkedClubIdRef.current !== clubId;

      if (isFirstCheckForClub) {
        setSubscriptionLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("saas_subscriptions")
          .select(`
            status,
            trial_ends_at,
            current_period_end,
            access_type,
            access_until
          `)
          .eq("club_id", clubId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setHasAccess(
          hasSubscriptionAccess(
            data as SaasSubscription | null,
          ),
        );

        checkedClubIdRef.current = clubId;
      } catch (error) {
        console.error(
          "Error verificando suscripción:",
          error,
        );

        /*
         * Si ya teníamos una verificación anterior,
         * mantenemos el acceso actual y no bloqueamos
         * visualmente el dashboard por un error temporal.
         */
        if (isFirstCheckForClub) {
          setHasAccess(false);
        }
      } finally {
        if (isFirstCheckForClub) {
          setSubscriptionLoading(false);
        }
      }
    }

    checkSubscription();
  }, [loading, profile?.club_id]);

  if (loading || subscriptionLoading) {
    return <Loading />;
  }

  if (!profile?.club_id) {
    return <CreateClubWizard />;
  }

  if (
    !hasAccess &&
    location.pathname !== "/dashboard/subscription"
  ) {
    return (
      <Navigate
        to="/dashboard/subscription"
        replace
      />
    );
  }

  return <>{children}</>;
}