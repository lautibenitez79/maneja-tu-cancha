import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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

  // Acceso gratuito / bonificado
  if (subscription.access_type === "complimentary") {
    // Sin fecha de vencimiento = permanente
    if (!subscription.access_until) {
      return subscription.status === "active";
    }

    return (
      subscription.status === "active" &&
      new Date(subscription.access_until).getTime() > now
    );
  }

  // Prueba gratuita
  if (subscription.status === "trialing") {
    if (!subscription.trial_ends_at) {
      return false;
    }

    return new Date(subscription.trial_ends_at).getTime() > now;
  }

  // Suscripción paga activa
  if (subscription.status === "active") {
    if (!subscription.current_period_end) {
      return false;
    }

    return new Date(subscription.current_period_end).getTime() > now;
  }

  // past_due, cancelled y expired no tienen acceso
  return false;
}

export default function DashboardGate({
  children,
}: Props) {
  const {
    loading,
    profile,
  } = useAuth();

  const location = useLocation();

  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!profile?.club_id) {
      setSubscriptionLoading(false);
      return;
    }

    async function checkSubscription() {
      try {
        setSubscriptionLoading(true);

        const { data, error } = await supabase
          .from("saas_subscriptions")
          .select(`
            status,
            trial_ends_at,
            current_period_end,
            access_type,
            access_until
          `)
          .eq("club_id", profile!.club_id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setHasAccess(
          hasSubscriptionAccess(
            data as SaasSubscription | null,
          ),
        );
      } catch (error) {
        console.error(
          "Error verificando suscripción:",
          error,
        );

        setHasAccess(false);
      } finally {
        setSubscriptionLoading(false);
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

  /*
   * La pantalla de suscripción debe seguir siendo accesible
   * aunque el acceso al dashboard haya vencido.
   */
  if (!hasAccess && location.pathname !== "/dashboard/subscription") {
    return (
      <Navigate
        to="/dashboard/subscription"
        replace
      />
    );
  }

  return <>{children}</>;
}