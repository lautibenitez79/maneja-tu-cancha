import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import { publicBookingService } from "../services/public-booking.service";

const PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;
const POLLING_INTERVAL_MS = 3000;

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export default function PaymentPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reservationId = searchParams.get("reservation_id");

  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [now, setNow] = useState(Date.now());

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState(false);

  /*
   * ---------------------------------------------------------
   * CONSULTAR RESERVA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!reservationId) {
      setError("No se encontró la reserva.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadReservation() {
      const { data, error } = await supabase.rpc("get_public_reservation", {
        p_reservation_id: reservationId,
      });

      if (!active) {
        return;
      }

      if (error) {
        console.error("Error consultando reserva:", error);

        setError("No pudimos consultar el estado de tu reserva.");

        setLoading(false);

        return;
      }

      if (!data) {
        setError("No encontramos la reserva.");

        setLoading(false);

        return;
      }

      const reservationData = data as Reservation;

      setReservation(reservationData);

      setLoading(false);

      /*
       * Si el webhook ya confirmó
       * el pago mientras el usuario
       * estaba llegando a esta página,
       * vamos directamente al éxito.
       */

      if (reservationData.status === "confirmed") {
        sessionStorage.removeItem(`payment_url_${reservationData.id}`);

        navigate(`/pago/exito?reservation_id=${reservationData.id}`, {
          replace: true,
        });

        return;
      }
    }

    loadReservation();

    const interval = window.setInterval(loadReservation, POLLING_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [reservationId, navigate]);

  useEffect(() => {
    if (!reservationId) return;

    const storedPaymentUrl = sessionStorage.getItem(
      `payment_url_${reservationId}`,
    );

    setPaymentUrl(storedPaymentUrl);
  }, [reservationId]);

  /*
   * ---------------------------------------------------------
   * RELOJ
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* Cancelamos la reserva */

  async function handleCancelReservation() {
    if (!reservationId || !reservation) {
      return;
    }

    const confirmed = window.confirm(
      "¿Querés cancelar esta reserva? El horario quedará disponible para otra persona.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const cancelled =
        await publicBookingService.cancelReservation(reservationId);

      setReservation(cancelled);

      sessionStorage.removeItem(`payment_url_${reservationId}`);
    } catch (error) {
      console.error("Error cancelando reserva pública:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar la reserva.",
      );
    } finally {
      setCancelling(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * TIEMPO RESTANTE
   * ---------------------------------------------------------
   */

  const remainingTime = useMemo(() => {
    if (!reservation) {
      return PAYMENT_TIMEOUT_MS;
    }

    const createdAt = new Date(reservation.created_at).getTime();

    const expiresAt = createdAt + PAYMENT_TIMEOUT_MS;

    return Math.max(0, expiresAt - now);
  }, [reservation, now]);

  /*
   * ---------------------------------------------------------
   * ESTADO
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Consultando tu reserva...
          </p>
        </div>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border bg-[var(--color-card)] p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
              !
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--color-title)]">
              No pudimos consultar la reserva
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {error || "La reserva no se encuentra disponible."}
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition hover:opacity-90"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * La base de datos ya canceló la reserva.
   */

  if (reservation.status === "cancelled") {
    sessionStorage.removeItem(`payment_url_${reservation.id}`);

    return (
      <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border bg-[var(--color-card)] p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
              ×
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--color-title)]">
              Reserva cancelada
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              El tiempo disponible para completar el pago se agotó y la reserva
              fue liberada.
            </p>

            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-left">
              <p className="text-sm font-medium text-red-700">
                Esta reserva ya no está disponible.
              </p>

              <p className="mt-1 text-sm text-red-600">
                Podés volver a la página del complejo y seleccionar otro
                horario.
              </p>
            </div>

            <Link
              to="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition hover:opacity-90"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGO PENDIENTE
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border bg-[var(--color-card)] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl text-yellow-600">
            ⏳
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[var(--color-title)]">
            Pago pendiente
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Estamos esperando la confirmación de Mercado Pago.
          </p>

          <div className="mt-6 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-700">
              Tu reserva está temporalmente guardada
            </p>

            <p className="mt-1 text-sm text-yellow-600">
              Cuando Mercado Pago confirme la operación, tu reserva se
              actualizará automáticamente.
            </p>
          </div>

          <div className="mt-6 rounded-xl border bg-[var(--color-card)] p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Tiempo para completar el pago
            </p>

            <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-title)]">
              {formatRemainingTime(remainingTime)}
            </p>

            {paymentUrl && (
              <div className="mt-6">
                <p className="text-sm text-slate-500">
                  ¿Cerraste la ventana de Mercado Pago?
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.open(paymentUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition hover:opacity-90"
                >
                  Continuar con el pago
                </button>
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Si el tiempo se agota, la reserva será cancelada y el horario
              quedará disponible.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
            Esperando confirmación...
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Volver al inicio
          </Link>

          <button
            type="button"
            onClick={handleCancelReservation}
            disabled={cancelling}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-red-200 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling ? "Cancelando..." : "Cancelar reserva"}
          </button>
        </div>
      </div>
    </main>
  );
}
