import Card from "@/components/ui/Card/index";

import type { DashboardStats } from "../types/dashboard.types";

interface Props {
  stats: DashboardStats;
}

export default function StatsCards({
  stats,
}: Props) {
  const cards = [
    {
      title: "Canchas",
      value: stats.resources,
    },

    {
      title: "Reservas hoy",
      value: stats.reservations,
    },

    {
      title: "Ingresos hoy",
      value: `$${stats.income.toLocaleString(
        "es-AR",
      )}`,
    },

    {
      title: "Pendientes de pago",
      value: stats.pendingPayments,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
        >
          <p className="text-[var(--color-text)]">
            {card.title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-[var(--color-title)]">
            {card.value}
          </h2>
        </Card>
      ))}
    </div>
  );
}