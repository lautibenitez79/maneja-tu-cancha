import Card from "@/components/ui/Card/index";

import type { DashboardHourPoint } from "../types/dashboard.types";

interface Props {
  hours: DashboardHourPoint[];
}

export default function PopularHours({
  hours,
}: Props) {
  const max =
    Math.max(
      ...hours.map(
        (item) => item.reservations,
      ),
      1,
    );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--color-title)]">
        Horarios más utilizados
      </h3>

      <p className="mt-1 text-sm text-[var(--color-text)]">
        Franjas con mayor cantidad de reservas.
      </p>

      {hours.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-text)]">
          Todavía no hay suficientes reservas.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {hours.map((item) => (
            <div
              key={item.hour}
              className="flex items-center gap-3"
            >
              <span className="w-12 shrink-0 text-sm font-medium">
                {item.hour}
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{
                    width: `${
                      (item.reservations /
                        max) *
                      100
                    }%`,
                  }}
                />
              </div>

              <span className="w-8 text-right text-sm text-[var(--color-text)]">
                {item.reservations}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}