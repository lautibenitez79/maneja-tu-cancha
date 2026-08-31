import type { DashboardPeriod } from "../types/dashboard.types";

interface Props {
  value: DashboardPeriod;
  onChange(value: DashboardPeriod): void;
}

export default function PeriodSelector({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target
            .value as DashboardPeriod,
        )
      }
      className="rounded-lg border bg-[var(--color-card)] px-3 py-2 text-sm"
    >
      <option value="today">
        Hoy
      </option>

      <option value="week">
        Esta semana
      </option>

      <option value="month">
        Este mes
      </option>
    </select>
  );
}