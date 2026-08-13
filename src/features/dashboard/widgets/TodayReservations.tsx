import Card from "@/components/ui/Card/index";

import type { Reservation } from "@/features/reservations/types/reservation.types";

interface Props {
  reservations: Reservation[];
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(
  status: Reservation["status"],
) {
  switch (status) {
    case "confirmed":
      return "Confirmada";

    case "pending_payment":
      return "Pendiente de pago";

    case "cancelled":
      return "Cancelada";

    case "no_show":
      return "No se presentó";

    default:
      return status;
  }
}

function getStatusClass(
  status: Reservation["status"],
) {
  switch (status) {
    case "confirmed":
      return "bg-green-50 text-green-700";

    case "pending_payment":
      return "bg-yellow-50 text-yellow-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    case "no_show":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function TodayReservations({
  reservations,
}: Props) {
  return (
    <Card padding={false}>
      <div className="border-b px-6 py-5">
        <h2 className="text-lg font-semibold text-[var(--color-title)]">
          Reservas de hoy
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text)]">
          Actividad programada para hoy.
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="font-medium text-[var(--color-title)]">
            No hay reservas para hoy.
          </p>

          <p className="mt-1 text-sm text-[var(--color-text)]">
            Cuando se genere una reserva aparecerá acá.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-title)]">
                  {formatTime(reservation.starts_at)}
                  {" — "}
                  {formatTime(reservation.ends_at)}
                </p>

                <p className="mt-1 truncate text-sm text-[var(--color-text)]">
                  {reservation.customer_name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                    reservation.status,
                  )}`}
                >
                  {getStatusLabel(
                    reservation.status,
                  )}
                </span>

                <span className="text-sm font-medium text-[var(--color-title)]">
                  $
                  {Number(
                    reservation.amount_paid,
                  ).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}