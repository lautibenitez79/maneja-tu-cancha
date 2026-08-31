import Card from "@/components/ui/Card/index";

import type { DashboardRevenuePoint } from "../types/dashboard.types";

interface Props {
  data: DashboardRevenuePoint[];
}

export default function RevenueChart({
  data,
}: Props) {
  const width = 700;
  const height = 260;

  const padding = 40;

  const maxValue = Math.max(
    ...data.map(
      (item) => item.value,
    ),
    1,
  );

  const points = data.map(
    (item, index) => {
      const x =
        data.length === 1
          ? width / 2
          : padding +
            (index /
              (data.length - 1)) *
              (width -
                padding * 2);

      const y =
        height -
        padding -
        (item.value /
          maxValue) *
          (height -
            padding * 2);

      return {
        ...item,
        x,
        y,
      };
    },
  );

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`,
    )
    .join(" ");

  return (
    <Card>
      <h3 className="text-lg font-semibold text-[var(--color-title)]">
        Ingresos
      </h3>

      <p className="mt-1 text-sm text-[var(--color-text)]">
        Evolución durante el período seleccionado.
      </p>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-text)]">
          No hay datos para mostrar.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto min-w-[600px] w-full"
            role="img"
            aria-label="Gráfico de ingresos"
          >
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="currentColor"
              strokeOpacity="0.15"
            />

            <path
              d={path}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((point) => (
              <g key={point.label}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="var(--color-primary)"
                />

                <text
                  x={point.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </Card>
  );
}