import Card from "@/components/ui/Card/index";

import type {
  DashboardAnalytics as DashboardAnalyticsType,
  DashboardPeriod,
} from "../types/dashboard.types";

interface Props {
  analytics: DashboardAnalyticsType | null;
  period: DashboardPeriod;
  onPeriodChange(period: DashboardPeriod): void;
  loading: boolean;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-AR")}`;
}

function formatPercentage(value: number) {
  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}

function getComparisonClass(value: number) {
  if (value > 0) {
    return "text-green-600";
  }

  if (value < 0) {
    return "text-red-600";
  }

  return "text-slate-500";
}

function getPeriodLabel(period: DashboardPeriod) {
  switch (period) {
    case "today":
      return "Hoy";

    case "week":
      return "Esta semana";

    case "month":
      return "Este mes";
  }
}

export default function DashboardAnalytics({
  analytics,
  period,
  onPeriodChange,
  loading,
}: Props) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-title)]">
            Métricas
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text)]">
            Rendimiento del complejo.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) =>
            onPeriodChange(
              event.target.value as DashboardPeriod,
            )
          }
          className="rounded-lg border bg-[var(--color-card)] px-4 py-2 text-sm"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      {loading || !analytics ? (
        <Card>
          <p className="text-sm text-[var(--color-text)]">
            {loading
              ? "Cargando métricas..."
              : "No hay métricas disponibles."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="text-sm text-[var(--color-text)]">
                Ingresos
              </p>

              <p className="mt-2 text-3xl font-bold text-[var(--color-title)]">
                {formatMoney(
                  analytics.revenue.value,
                )}
              </p>

              <p
                className={`mt-2 text-sm ${getComparisonClass(
                  analytics.revenue.percentage,
                )}`}
              >
                {formatPercentage(
                  analytics.revenue.percentage,
                )}{" "}
                vs. período anterior
              </p>
            </Card>

            <Card>
              <p className="text-sm text-[var(--color-text)]">
                Ocupación
              </p>

              <p className="mt-2 text-3xl font-bold text-[var(--color-title)]">
                {analytics.occupancy.percentage}%
              </p>

              <p
                className={`mt-2 text-sm ${getComparisonClass(
                  analytics.occupancyComparison
                    .percentage,
                )}`}
              >
                {formatPercentage(
                  analytics.occupancyComparison
                    .percentage,
                )}{" "}
                vs. período anterior
              </p>

              <p className="mt-2 text-xs text-[var(--color-text)]">
                {analytics.occupancy.occupied} ocupados ·{" "}
                {analytics.occupancy.available} disponibles
              </p>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-[var(--color-title)]">
              Ingresos por día
            </h3>

            <div className="mt-5 space-y-3">
              {analytics.revenueByDay.map(
                (point) => {
                  const max = Math.max(
                    ...analytics.revenueByDay.map(
                      (item) => item.value,
                    ),
                    1,
                  );

                  const width =
                    (point.value / max) * 100;

                  return (
                    <div
                      key={point.label}
                      className="grid grid-cols-[45px_1fr_auto] items-center gap-3"
                    >
                      <span className="text-xs text-[var(--color-text)]">
                        {point.label}
                      </span>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[var(--color-primary)]"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs font-medium text-[var(--color-title)]">
                        {formatMoney(
                          point.value,
                        )}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <h3 className="font-semibold text-[var(--color-title)]">
                Reservas
              </h3>

              <p className="mt-2 text-3xl font-bold text-[var(--color-title)]">
                {analytics.reservations.value}
              </p>

              <p
                className={`mt-2 text-sm ${getComparisonClass(
                  analytics.reservations.percentage,
                )}`}
              >
                {formatPercentage(
                  analytics.reservations.percentage,
                )}{" "}
                vs. período anterior
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-[var(--color-title)]">
                Horarios más utilizados
              </h3>

              {analytics.popularHours.length ===
              0 ? (
                <p className="mt-4 text-sm text-[var(--color-text)]">
                  Todavía no hay reservas.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {analytics.popularHours.map(
                    (item) => (
                      <div
                        key={item.hour}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <span className="font-medium">
                          {item.hour}
                        </span>

                        <span className="text-sm text-[var(--color-text)]">
                          {item.reservations}{" "}
                          {item.reservations === 1
                            ? "reserva"
                            : "reservas"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      <p className="text-xs text-[var(--color-text)]">
        Período: {getPeriodLabel(period)}
      </p>
    </section>
  );
}