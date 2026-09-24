import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

import CreateClubWizard from "@/features/clubs/components/CreateClubWizard";
import Loading from "@/components/ui/Loading";

interface Props {
  children: ReactNode;
}

export default function DashboardGate({
  children,
}: Props) {
  const { loading, profile } = useAuth();
  const location = useLocation();

  const [subscriptionLoading, setSubscriptionLoading] =
    useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const isSubscriptionPage =
    location.pathname === "/dashboard/subscription";

  const checkSubscriptionAccess = useCallback(
    async (showLoading = false) => {
      if (!profile?.club_id || isSubscriptionPage) {
        if (showLoading) {
          setSubscriptionLoading(false);
        }

        return;
      }

      if (showLoading) {
        setSubscriptionLoading(true);
      }

      try {
        /*
         * La base de datos es la fuente de verdad.
         *
         * Supabase evalúa nuevamente:
         * - trial_ends_at
         * - current_period_end
         * - access_until
         * - status
         * - access_type
         *
         * usando now() en el servidor.
         */
        const { data, error } = await supabase.rpc(
          "has_subscription_access",
        );

        if (error) {
          throw error;
        }

        setHasAccess(data === true);
      } catch (error) {
        console.error(
          "Error verificando acceso a la suscripción:",
          error,
        );

        /*
         * Fail closed:
         * si no podemos comprobar el acceso,
         * no damos acceso al dashboard.
         */
        setHasAccess(false);
      } finally {
        if (showLoading) {
          setSubscriptionLoading(false);
        }
      }
    },
    [profile?.club_id, isSubscriptionPage],
  );

  /*
   * Primera comprobación y comprobación cada vez
   * que cambia la sección del dashboard.
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!profile?.club_id) {
      setSubscriptionLoading(false);
      setHasAccess(false);
      return;
    }

    if (isSubscriptionPage) {
      setSubscriptionLoading(false);
      setHasAccess(true);
      return;
    }

    checkSubscriptionAccess(true);
  }, [
    loading,
    profile?.club_id,
    isSubscriptionPage,
    checkSubscriptionAccess,
  ]);

  /*
   * Comprobación periódica.
   *
   * Esto permite detectar que el trial venció aunque
   * el usuario deje la aplicación abierta durante días.
   */
  useEffect(() => {
    if (
      loading ||
      !profile?.club_id ||
      isSubscriptionPage
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      checkSubscriptionAccess(false);
    }, 10 * 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    loading,
    profile?.club_id,
    isSubscriptionPage,
    checkSubscriptionAccess,
  ]);

  /*
   * Cuando el usuario vuelve a la pestaña,
   * comprobamos inmediatamente el acceso.
   *
   * Ejemplo:
   * dejó la pestaña abierta durante 2 horas,
   * volvió y el trial había vencido.
   */
  useEffect(() => {
    if (
      loading ||
      !profile?.club_id ||
      isSubscriptionPage
    ) {
      return;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkSubscriptionAccess(false);
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [
    loading,
    profile?.club_id,
    isSubscriptionPage,
    checkSubscriptionAccess,
  ]);

  if (loading || subscriptionLoading) {
    return <Loading />;
  }

  if (!profile?.club_id) {
    return <CreateClubWizard />;
  }

  /*
   * La página de suscripción siempre queda accesible.
   */
  if (isSubscriptionPage) {
    return <>{children}</>;
  }

  /*
   * Si la base de datos indica que no tiene acceso,
   * lo enviamos a la página de suscripción.
   */
  if (!hasAccess) {
    return (
      <Navigate
        to="/dashboard/subscription"
        replace
      />
    );
  }

  return <>{children}</>;
}