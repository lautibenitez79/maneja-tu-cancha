import Card from "@/components/ui/Card/index";

import type { DashboardOccupancy } from "../types/dashboard.types";

interface Props {
  occupancy: DashboardOccupancy;
}

export default function OccupancyCard({
  occupancy,
}: Props) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-text)]">
            Ocupación
          </p>

          <h2 className="mt-2 text-4xl font-bold text-[var(--color-title)]">
            {occupancy.percentage}%
          </h2>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all"
          style={{
            width: `${occupancy.percentage}%`,
          }}
        />
      </div>

      <p className="mt-3 text-sm text-[var(--color-text)]">
        {occupancy.occupied} turnos ocupados de{" "}
        {occupancy.occupied +
          occupancy.available}{" "}
        disponibles.
      </p>
    </Card>
  );
}