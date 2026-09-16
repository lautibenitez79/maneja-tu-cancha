import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import Page from "@/components/ui/Page";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { ReservationsFilters } from "../components/ReservationsFilters";
import { ReservationPaymentSummary } from "../components/ReservationPaymentSummary";
import { ReservationsTable } from "../components/ReservationsTable";

import {
  reservationTrackingService,
} from "../services/reservation-tracking.service";

import type {
  BalancePaymentMethod,
} from "../types/reservation.types";

import type {
  ReservationAttendanceFilter,
  ReservationTracking,
} from "../types/reservation-tracking.types";

function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReservationsPage() {
  const { profile } = useAuth();

  const clubId = profile?.club_id ?? null;

  const [date, setDate] =
    useState(getToday);

  const [attendance, setAttendance] =
    useState<ReservationAttendanceFilter>(
      "all",
    );

  const [reservations, setReservations] =
    useState<ReservationTracking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  async function loadReservations(
    silent = false,
  ) {
    if (!clubId) return;

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data =
        await reservationTrackingService.getReservations(
          {
            clubId,
            date,
            attendance,
          },
        );

      setReservations(data);
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudieron cargar las reservas.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadReservations();
  }, [
    clubId,
    date,
    attendance,
  ]);

  const summary = useMemo(
    () =>
      reservationTrackingService.calculateSummary(
        reservations,
      ),
    [reservations],
  );

  async function handleAttendanceChange(
    reservation: ReservationTracking,
    status:
      | "attended"
      | "no_show",
    reason: string | null,
  ) {
    try {
      await reservationTrackingService.updateAttendance(
        reservation.id,
        status,
        reason,
      );

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id
            ? {
                ...item,
                attendance_status: status,
                no_show_reason:
                  status === "no_show"
                    ? reason
                    : null,
              }
            : item,
        ),
      );

      toast.success(
        status === "attended"
          ? "Asistencia registrada."
          : "No asistencia registrada.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo actualizar la asistencia.",
      );

      throw error;
    }
  }

  async function handlePaymentChange(
    reservation: ReservationTracking,
    amount: number,
    method: BalancePaymentMethod | null,
  ) {
    if (
      reservation.attendance_status ===
      "no_show"
    ) {
      return;
    }

    const total = Number(
      reservation.total_amount ?? 0,
    );

    const deposit = Number(
      reservation.amount_paid ?? 0,
    );

    const pendingBeforePayment =
      Math.max(
        0,
        total - deposit,
      );

    if (
      amount > pendingBeforePayment
    ) {
      toast.error(
        "El pago del saldo no puede superar el importe pendiente.",
      );

      throw new Error(
        "Balance payment exceeds pending amount.",
      );
    }

    if (amount > 0 && !method) {
      toast.error(
        "Seleccioná el método de pago.",
      );

      throw new Error(
        "Payment method required.",
      );
    }

    try {
      await reservationTrackingService.updateBalancePayment(
        reservation.id,
        amount,
        method,
      );

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id
            ? {
                ...item,
                balance_paid_amount: amount,
                balance_payment_method:
                  method,
              }
            : item,
        ),
      );

      toast.success(
        "Pago actualizado.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo actualizar el pago.",
      );

      throw error;
    }
  }

  async function handleProofUpload(
    reservation: ReservationTracking,
    file: File,
  ) {
    if (
      reservation.attendance_status ===
      "no_show"
    ) {
      return;
    }

    if (!clubId) {
      throw new Error(
        "Club no encontrado.",
      );
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error(
        "El comprobante debe ser una imagen o PDF.",
      );

      throw new Error(
        "Invalid proof type.",
      );
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        "El comprobante no puede superar los 10 MB.",
      );

      throw new Error(
        "Proof file too large.",
      );
    }

    try {
      const result =
        await reservationTrackingService.uploadProof(
          clubId,
          reservation.id,
          file,
        );

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id
            ? {
                ...item,
                balance_payment_proof_url:
                  result.path,
              }
            : item,
        ),
      );

      toast.success(
        "Comprobante guardado.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar el comprobante.",
      );

      throw error;
    }
  }

  if (!clubId) {
    return (
      <Page
        title="Reservas"
        subtitle="Controlá asistencia y pagos de tus reservas."
      >
        <div className="flex min-h-60 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No se encontró el club asociado.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="Reservas"
      subtitle="Controlá asistencia y pagos de tus reservas."
      action={
        <button
          type="button"
          disabled={
            loading ||
            refreshing
          }
          onClick={() =>
            void loadReservations(true)
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}

          Actualizar
        </button>
      }
    >
      <div className="space-y-6">
        <ReservationsFilters
          date={date}
          attendance={attendance}
          onDateChange={setDate}
          onAttendanceChange={
            setAttendance
          }
        />

        <ReservationPaymentSummary
          summary={summary}
        />

        <ReservationsTable
          reservations={reservations}
          clubId={clubId}
          loading={loading}
          onAttendanceChange={
            handleAttendanceChange
          }
          onPaymentChange={
            handlePaymentChange
          }
          onProofUpload={
            handleProofUpload
          }
        />
      </div>
    </Page>
  );
}