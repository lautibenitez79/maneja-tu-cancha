import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Gift } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type SubscriptionPlan =
  | "monthly"
  | "three_months"
  | "annual"
  | "test";

interface SaasSubscription {
  id: string;
  club_id: string;
  plan: SubscriptionPlan | null;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "cancelled"
    | "expired";
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  starts_at: string;
  current_period_start: string;
  current_period_end: string;
  access_type: "paid" | "complimentary";
  access_until: string | null;
}

const plans = [
  {
    key: "monthly" as const,
    name: "Mensual",
    price: "$60.000",
    period: "por mes",
    description: "Flexibilidad mes a mes.",
  },
  {
    key: "three_months" as const,
    name: "3 meses",
    price: "$180.000",
    period: "por 3 meses",
    description: "Pagás 3 meses y el 4.º es gratis.",
  },
  {
    key: "annual" as const,
    name: "Anual",
    price: "$480.000",
    period: "por año",
    description: "El plan más conveniente.",
    featured: true,
  },
];

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
  }).format(new Date(value));
}

function getStatusLabel(subscription: SaasSubscription | null) {
  if (!subscription) return "Sin suscripción";

  if (
    subscription.access_type === "complimentary" &&
    subscription.status === "active"
  ) {
    return subscription.access_until
      ? "Acceso bonificado"
      : "Acceso permanente";
  }

  switch (subscription.status) {
    case "trialing":
      return "Prueba gratuita";
    case "active":
      return "Suscripción activa";
    case "past_due":
      return "Pago pendiente";
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Vencida";
    default:
      return "Sin suscripción";
  }
}

function getPlanLabel(plan: SubscriptionPlan | null) {
  switch (plan) {
    case "monthly":
      return "Mensual";
    case "three_months":
      return "3 meses";
    case "annual":
      return "Anual";
    case "test":
      return "Prueba técnica";
    default:
      return "—";
  }
}

export default function SubscriptionPage() {
  const { profile, loading: authLoading } = useAuth();

  const [subscription, setSubscription] =
    useState<SaasSubscription | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadingPlan, setLoadingPlan] =
    useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (authLoading || !profile?.club_id) {
      return;
    }

    async function loadSubscription() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("saas_subscriptions")
          .select(
            `
            id,
            club_id,
            plan,
            status,
            trial_starts_at,
            trial_ends_at,
            starts_at,
            current_period_start,
            current_period_end,
            access_type,
            access_until
          `,
          )
          .eq("club_id", profile!.club_id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setSubscription(data as SaasSubscription | null);
      } catch (error) {
        console.error("Error cargando suscripción:", error);

        toast.error("No se pudo cargar la información de suscripción.");
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [authLoading, profile?.club_id]);

  async function handlePlanClick(
    plan: SubscriptionPlan,
    forcedEmail?: string,
  ) {
    try {
      setLoadingPlan(plan);

      const { data: sessionData } =
        await supabase.auth.getSession();

      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error(
          "Tu sesión expiró. Volvé a iniciar sesión.",
        );
        return;
      }

      const payerEmail =
        forcedEmail ??
        window.prompt(
          "Ingresá el email de la cuenta de Mercado Pago que va a pagar:",
        );

      if (!payerEmail) {
        return;
      }

      const response = await fetch(
        "/api/mercadopago/create-saas-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan,
            payer_email: payerEmail.trim().toLowerCase(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.init_point) {
        throw new Error(
          data.error ??
            "No se pudo crear el checkout de Mercado Pago.",
        );
      }

      console.log("Checkout SaaS creado:", data);

      window.location.href = data.init_point;
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el pago.",
      );
    } finally {
      setLoadingPlan(null);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Cargando suscripción...
        </p>
      </div>
    );
  }

  const isComplimentary =
    subscription?.access_type === "complimentary";

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold">
          Suscripción
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Administrá el acceso a Maneja Tu Cancha.
        </p>
      </div>

      {/* Estado actual */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {isComplimentary ? (
            <Gift className="mt-1 h-6 w-6 text-[var(--color-primary)]" />
          ) : subscription?.status === "active" ? (
            <CheckCircle2 className="mt-1 h-6 w-6 text-[var(--color-primary)]" />
          ) : (
            <Clock className="mt-1 h-6 w-6 text-[var(--color-primary)]" />
          )}

          <div className="flex-1">
            <p className="text-sm text-gray-500">
              Estado actual
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {getStatusLabel(subscription)}
            </h2>

            {isComplimentary ? (
              <p className="mt-2 text-sm text-gray-600">
                {subscription?.access_until
                  ? `Acceso bonificado hasta ${formatDate(
                      subscription.access_until,
                    )}.`
                  : "Tenés acceso permanente mientras la suscripción permanezca activa."}
              </p>
            ) : subscription?.status === "trialing" ? (
              <p className="mt-2 text-sm text-gray-600">
                Tu prueba gratuita finaliza el{" "}
                <strong>
                  {formatDate(subscription.trial_ends_at)}
                </strong>
                .
              </p>
            ) : subscription?.status === "active" ? (
              <p className="mt-2 text-sm text-gray-600">
                Próximo vencimiento:{" "}
                <strong>
                  {formatDate(
                    subscription.current_period_end,
                  )}
                </strong>
                .
              </p>
            ) : null}
          </div>
        </div>

        {subscription && !isComplimentary && (
          <div className="mt-6 grid gap-4 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Plan
              </p>

              <p className="mt-1 font-medium">
                {getPlanLabel(subscription.plan)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Período actual
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  subscription.current_period_start,
                )}
                {" — "}
                {formatDate(
                  subscription.current_period_end,
                )}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Planes */}
      {!isComplimentary && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Elegí tu plan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Todos los planes incluyen el acceso a
              Maneja Tu Cancha.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.key}
                className={`relative rounded-2xl border bg-[var(--color-card)] p-6 shadow-sm ${
                  plan.featured
                    ? "border-[var(--color-primary)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
                    Recomendado
                  </span>
                )}

                <h3 className="text-lg font-semibold">
                  {plan.name}
                </h3>

                <div className="mt-5">
                  <span className="text-3xl font-bold">
                    {plan.price}
                  </span>

                  <span className="ml-2 text-sm text-gray-500">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-3 min-h-[40px] text-sm text-gray-600">
                  {plan.description}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handlePlanClick(plan.key)
                  }
                  disabled={loadingPlan === plan.key}
                  className="mt-6 w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === plan.key
                    ? "Procesando..."
                    : "Contratar plan"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}