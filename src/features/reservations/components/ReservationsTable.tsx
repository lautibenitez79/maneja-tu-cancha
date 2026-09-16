import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { BalancePaymentMethod } from "../types/reservation.types";
import type { ReservationTracking } from "../types/reservation-tracking.types";

import { ReservationAttendance } from "./ReservationAttendance";
import { ReservationPaymentCell } from "./ReservationPaymentCell";
import { ReservationProof } from "./ReservationProof";

interface ReservationsTableProps {
  reservations: ReservationTracking[];
  clubId: string;

  onAttendanceChange: (
    reservation: ReservationTracking,
    attendance: "attended" | "no_show",
    reason: string | null,
  ) => Promise<void>;

  onPaymentChange: (
    reservation: ReservationTracking,
    amount: number,
    method: BalancePaymentMethod | null,
  ) => Promise<void>;

  onProofUpload: (
    reservation: ReservationTracking,
    file: File,
  ) => Promise<void>;

  loading: boolean;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function money(value: number) {
  return `$${Number(value ?? 0).toLocaleString("es-AR")}`;
}

export function ReservationsTable({
  reservations,
  clubId,
  onAttendanceChange,
  onPaymentChange,
  onProofUpload,
  loading,
}: ReservationsTableProps) {
  const [savingId, setSavingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border bg-[var(--color-card)]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-2xl border bg-[var(--color-card)] p-6 text-center text-sm text-muted-foreground">
        No hay reservas para los filtros seleccionados.
      </div>
    );
  }

  async function withSaving(
    id: string,
    callback: () => Promise<void>,
  ) {
    try {
      setSavingId(id);
      await callback();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      {/* =========================
          DESKTOP / TABLET
      ========================== */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border bg-[var(--color-card)]">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-4 py-3 font-medium">
                Horario
              </th>

              <th className="px-4 py-3 font-medium">
                Cancha
              </th>

              <th className="px-4 py-3 font-medium">
                Nombre
              </th>

              <th className="px-4 py-3 font-medium">
                Teléfono
              </th>

              <th className="px-4 py-3 font-medium">
                Asistencia
              </th>

              <th className="px-4 py-3 font-medium">
                Abono reserva
              </th>

              <th className="px-4 py-3 font-medium">
                Total
              </th>

              <th className="px-4 py-3 font-medium">
                Saldo faltante
              </th>

              <th className="px-4 py-3 font-medium">
                Pago saldo
              </th>

              <th className="px-4 py-3 font-medium">
                Comprobante
              </th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => {
              const total = Number(
                reservation.total_amount ?? 0,
              );

              const amountPaid = Number(
                reservation.amount_paid ?? 0,
              );

              const balancePaid = Number(
                reservation.balance_paid_amount ?? 0,
              );

              const pending = Math.max(
                0,
                total - amountPaid - balancePaid,
              );

              return (
                <tr
                  key={reservation.id}
                  className="border-b last:border-b-0"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-medium">
                    {formatTime(reservation.starts_at)}
                    {" – "}
                    {formatTime(reservation.ends_at)}
                  </td>

                  <td className="px-4 py-4">
                    {reservation.resource?.name ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    {reservation.customer_name}
                  </td>

                  <td className="px-4 py-4">
                    {reservation.customer_phone ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    <ReservationAttendance
                      reservation={reservation}
                      saving={
                        savingId === reservation.id
                      }
                      onSave={(attendance, reason) =>
                        withSaving(
                          reservation.id,
                          () =>
                            onAttendanceChange(
                              reservation,
                              attendance,
                              reason,
                            ),
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {money(amountPaid)}
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {money(total)}
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {money(pending)}
                  </td>

                  <td className="px-4 py-4">
                    <ReservationPaymentCell
                      reservation={reservation}
                      saving={
                        savingId === reservation.id
                      }
                      onSave={(amount, method) =>
                        withSaving(
                          reservation.id,
                          () =>
                            onPaymentChange(
                              reservation,
                              amount,
                              method,
                            ),
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-4">
                    <ReservationProof
                      reservation={reservation}
                      clubId={clubId}
                      onUpload={(file) =>
                        withSaving(
                          reservation.id,
                          () =>
                            onProofUpload(
                              reservation,
                              file,
                            ),
                        )
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================
          MOBILE
      ========================== */}
      <div className="space-y-3 md:hidden">
        {reservations.map((reservation) => {
          const total = Number(
            reservation.total_amount ?? 0,
          );

          const amountPaid = Number(
            reservation.amount_paid ?? 0,
          );

          const balancePaid = Number(
            reservation.balance_paid_amount ?? 0,
          );

          const pending = Math.max(
            0,
            total - amountPaid - balancePaid,
          );

          return (
            <div
              key={reservation.id}
              className="overflow-hidden rounded-2xl border bg-[var(--color-card)] shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b p-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDate(reservation.starts_at)}
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {formatTime(reservation.starts_at)}
                    {" – "}
                    {formatTime(reservation.ends_at)}
                  </p>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {reservation.resource?.name ?? "Sin cancha"}
                  </p>
                </div>

                <div className="shrink-0">
                  {reservation.attendance_status ===
                  "attended" ? (
                    <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                      Asistió
                    </span>
                  ) : reservation.attendance_status ===
                    "no_show" ? (
                    <span className="inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
                      No asistió
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-600">
                      Pendiente
                    </span>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Nombre
                  </p>

                  <p className="mt-1 truncate text-sm font-medium">
                    {reservation.customer_name}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Teléfono
                  </p>

                  <p className="mt-1 truncate text-sm">
                    {reservation.customer_phone || "—"}
                  </p>
                </div>
              </div>

              {/* Asistencia */}
              <div className="border-t p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Asistencia
                </p>

                <ReservationAttendance
                  reservation={reservation}
                  saving={
                    savingId === reservation.id
                  }
                  onSave={(attendance, reason) =>
                    withSaving(
                      reservation.id,
                      () =>
                        onAttendanceChange(
                          reservation,
                          attendance,
                          reason,
                        ),
                    )
                  }
                />
              </div>

              {/* Pagos */}
              <div className="border-t p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Pagos
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">
                      Abono reserva
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {money(amountPaid)}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">
                      Total
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {money(total)}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Saldo faltante
                      </p>

                      <p className="text-sm font-semibold">
                        {money(pending)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <ReservationPaymentCell
                    reservation={reservation}
                    saving={
                      savingId === reservation.id
                    }
                    onSave={(amount, method) =>
                      withSaving(
                        reservation.id,
                        () =>
                          onPaymentChange(
                            reservation,
                            amount,
                            method,
                          ),
                      )
                    }
                  />
                </div>
              </div>

              {/* Comprobante */}
              <div className="border-t p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Comprobante
                </p>

                <ReservationProof
                  reservation={reservation}
                  clubId={clubId}
                  onUpload={(file) =>
                    withSaving(
                      reservation.id,
                      () =>
                        onProofUpload(
                          reservation,
                          file,
                        ),
                    )
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}