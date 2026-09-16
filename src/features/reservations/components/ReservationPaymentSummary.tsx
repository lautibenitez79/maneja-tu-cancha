import type { ReservationPaymentSummary as Summary } from "../types/reservation-tracking.types";

interface ReservationPaymentSummaryProps {
  summary: Summary;
}

function money(value: number) {
  return `$${value.toLocaleString("es-AR")}`;
}

export function ReservationPaymentSummary({
  summary,
}: ReservationPaymentSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      <SummaryCard
        label="Reservas"
        value={summary.reservations.toString()}
      />

      <SummaryCard
        label="Asistieron"
        value={summary.attended.toString()}
      />

      <SummaryCard
        label="No asistieron"
        value={summary.noShow.toString()}
      />

      <SummaryCard
        label="Pendientes"
        value={summary.pendingAttendance.toString()}
      />

      <SummaryCard
        label="Abonos de reservas"
        value={money(summary.reservationPayments)}
      />

      <SummaryCard
        label="Pagos totales"
        value={money(summary.totalPayments)}
      />

      <SummaryCard
        label="Pendiente de cobro"
        value={money(summary.pendingCollection)}
      />

      <SummaryCard
        label="Efectivo"
        value={money(summary.cash)}
      />

      <SummaryCard
        label="Mercado Pago"
        value={money(summary.mercadoPago)}
      />

      <SummaryCard
        label="Transferencias"
        value={money(summary.transfer)}
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border bg-[var(--color-card)] p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}