import Card from "@/components/ui/Card/index";

import type { DashboardMetric } from "../types/dashboard.types";

interface Props {
  reservations: DashboardMetric;
  revenue: DashboardMetric;
  occupancy: DashboardMetric;
}

function formatPercentage(
  value: number,
) {
  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}

function ComparisonRow({
  label,
  metric,
}: {
  label: string;
  metric: DashboardMetric;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--color-text)]">
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${
          metric.percentage > 0
            ? "text-green-600"
            : metric.percentage < 0
              ? "text-red-500"
              : "text-slate-500"
        }`}
      >
        {formatPercentage(
          metric.percentage,
        )}
      </span>
    </div>
  );
}

export default function PeriodComparison({
  reservations,
  revenue,
  occupancy,
}: Props) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--color-title)]">
        Comparación
      </h3>

      <p className="mt-1 text-sm text-[var(--color-text)]">
        Respecto al período anterior.
      </p>

      <div className="mt-6 space-y-4">
        <ComparisonRow
          label="Reservas"
          metric={reservations}
        />

        <ComparisonRow
          label="Ingresos"
          metric={revenue}
        />

        <ComparisonRow
          label="Ocupación"
          metric={occupancy}
        />
      </div>
    </Card>
  );
}