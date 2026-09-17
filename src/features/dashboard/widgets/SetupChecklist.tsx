import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Trophy,
  ArrowRight,
} from "lucide-react";

import Card from "@/components/ui/Card";

interface Props {
  hasResources: boolean;
  hasWorkingHours: boolean;
  hasMercadoPago: boolean;
  hasPublicLink: boolean;
  hasReservations: boolean;
}

export default function SetupChecklist({
  hasResources,
  hasWorkingHours,
  hasMercadoPago,
  hasPublicLink,
  hasReservations,
}: Props) {
  const navigate = useNavigate();

  const items = [
    {
      title: "Crear tu primer recurso",
      done: hasResources,
      action: () => navigate("/dashboard/resources"),
      button: "Ir a Recursos",
    },
    {
      title: "Configurar horarios",
      done: hasWorkingHours,
      action: () => navigate("/dashboard/resources"),
      button: "Editar horarios",
    },
    {
      title: "Conectar Mercado Pago",
      done: hasMercadoPago,
      action: () => navigate("/dashboard"),
      button: "Conectar",
    },
    {
      title: "Compartir tu link público",
      done: hasPublicLink,
      action: () => navigate("/dashboard"),
      button: "Ver enlace",
    },
    {
      title: "Recibir la primera reserva",
      done: hasReservations,
      action: () => navigate("/dashboard/reservations"),
      button: "Ver reservas",
    },
  ];

  const progress = useMemo(
    () => items.filter((i) => i.done).length,
    [items],
  );

  const percent = (progress / items.length) * 100;

  return (
    <Card className="rounded-[var(--radius-card)] border bg-[var(--color-card)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            Tu progreso
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Completá estos pasos para comenzar a recibir reservas.
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-3 py-2 text-center">
          <p className="text-lg font-bold text-blue-700">
            {progress}/{items.length}
          </p>

          <p className="text-xs text-blue-600">
            completados
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span>Progreso</span>

          <span className="font-medium">
            {Math.round(percent)}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-xl border p-3"
          >
            <div className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-slate-300" />
              )}

              <div>
                <p className="font-medium">
                  {item.title}
                </p>

                <p className="text-xs text-slate-500">
                  {item.done
                    ? "Completado"
                    : "Pendiente"}
                </p>
              </div>
            </div>

            {!item.done && (
              <button
                onClick={item.action}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"
              >
                {item.button}

                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {progress === items.length ? (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-green-700">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />

            <span className="font-semibold">
              ¡Complejo listo para vender!
            </span>
          </div>

          <p className="mt-1 text-sm">
            Ya configuraste todo lo necesario para comenzar a gestionar reservas.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-700">
          <p className="font-medium">
            Te faltan {items.length - progress} pasos.
          </p>

          <p className="mt-1 text-sm">
            Cuanto antes completes el checklist, antes podrás automatizar las reservas de tu club.
          </p>
        </div>
      )}
    </Card>
  );
}