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
      title: "Recursos",
      value: stats.resources,
    },

    {
      title: "Reservas",
      value: stats.reservations,
    },

    {
      title: "Ingresos",
      value: "-",
    },

    {
      title: "Empleados",
      value: "-",
    },

  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">

      {cards.map((card) => (
        <Card
          key={card.title}
          className="rounded-xl border bg-white p-6 shadow-[var(--shadow-card)]"
        >
          <p className="text-gray-500">

            {card.title}

          </p>

          <h2 className="mt-3 text-4xl font-bold">

            {card.value}

          </h2>

        </Card>
      ))}

    </div>
  );
}