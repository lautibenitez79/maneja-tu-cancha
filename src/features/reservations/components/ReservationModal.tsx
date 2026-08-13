import {
  useEffect,
  useState,
} from "react";

import { toast } from "sonner";

import Modal from "@/components/ui/Modal";

import ReservationForm from "./ReservationForm";

import type {
  CalendarCell,
} from "@/features/calendar/types/calendar.types";

import type {
  CreateReservationForm,
  Reservation,
} from "../types/reservation.types";

import { reservationService } from "../services/reservation.service";

interface Props {
  open: boolean;

  cell: CalendarCell | null;

  resourceId: string;

  onClose(): void;

  onSubmit(
    values: CreateReservationForm,
  ): Promise<void>;

  onUpdated(): Promise<void>;
}

export default function ReservationModal({
  open,
  cell,
  resourceId,
  onClose,
  onSubmit,
  onUpdated,
}: Props) {
  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [
    loadingReservation,
    setLoadingReservation,
  ] = useState(false);

  const [
    amountPaid,
    setAmountPaid,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState<Reservation["status"]>(
    "confirmed",
  );

  const [saving, setSaving] =
    useState(false);

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    customerEmail,
    setCustomerEmail,
  ] = useState("");

  const [
    startsAt,
    setStartsAt,
  ] = useState("");

  const [
    endsAt,
    setEndsAt,
  ] = useState("");

  useEffect(() => {
    if (
      !cell ||
      !cell.reservationId
    ) {
      setReservation(null);
      return;
    }

    const reservationId =
      cell.reservationId;

    async function loadReservation() {
      try {
        setLoadingReservation(true);

        const data =
          await reservationService.getById(
            reservationId,
          );

        setReservation(data);

        setCustomerName(
          data.customer_name,
        );

        setCustomerPhone(
          data.customer_phone,
        );

        setCustomerEmail(
          data.customer_email,
        );

        setStartsAt(
          data.starts_at.slice(0, 16),
        );

        setEndsAt(
          data.ends_at.slice(0, 16),
        );

        setAmountPaid(
          String(data.amount_paid),
        );

        setStatus(data.status);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(
            "No se pudo cargar la reserva.",
          );
        }
      } finally {
        setLoadingReservation(false);
      }
    }

    loadReservation();
  }, [cell]);

  async function handleSave() {
    if (!reservation) {
      return;
    }

    const amount =
      Number(amountPaid);

    if (!customerName.trim()) {
      toast.error(
        "Ingresá el nombre del cliente.",
      );
      return;
    }

    if (!customerPhone.trim()) {
      toast.error(
        "Ingresá un teléfono.",
      );
      return;
    }

    if (!customerEmail.trim()) {
      toast.error(
        "Ingresá un email.",
      );
      return;
    }

    if (!startsAt || !endsAt) {
      toast.error(
        "Ingresá el horario.",
      );
      return;
    }

    if (startsAt >= endsAt) {
      toast.error(
        "La hora de fin debe ser mayor que la de inicio.",
      );
      return;
    }

    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {
      toast.error(
        "Ingresá un monto válido.",
      );
      return;
    }

    try {
      setSaving(true);

      await reservationService.update(
        reservation.id,
        {
          customer_name:
            customerName.trim(),

          customer_phone:
            customerPhone.trim(),

          customer_email:
            customerEmail.trim(),

          starts_at: `${startsAt}:00`,
          
          ends_at: `${endsAt}:00`,

          amount_paid: amount,

          status,
        },
      );

      toast.success(
        "Reserva actualizada correctamente.",
      );

      await onUpdated();

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "No se pudo actualizar la reserva.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (!cell) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reserva"
    >
      {cell.status === "available" ? (
        <ReservationForm
          resourceId={resourceId}
          startsAt={cell.starts_at}
          endsAt={cell.ends_at}
          onSubmit={onSubmit}
        />
      ) : loadingReservation ? (
        <div className="py-6 text-center">
          Cargando reserva...
        </div>
      ) : reservation ? (
        <div className="space-y-4">

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Nombre completo
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Teléfono
            </label>

            <input
              type="text"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Email
            </label>

            <input
              type="email"
              value={customerEmail}
              onChange={(event) =>
                setCustomerEmail(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Inicio
            </label>

            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) =>
                setStartsAt(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Fin
            </label>

            <input
              type="datetime-local"
              value={endsAt}
              onChange={(event) =>
                setEndsAt(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Estado
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as Reservation["status"],
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="pending_payment">
                Pendiente de pago
              </option>

              <option value="confirmed">
                Confirmada
              </option>

              <option value="cancelled">
                Cancelada
              </option>

              <option value="no_show">
                No se presentó
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500">
              Monto abonado
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(event) =>
                setAmountPaid(
                  event.target.value,
                )
              }
              disabled={saving}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>

        </div>
      ) : (
        <div className="space-y-4">

          <div>
            <p className="text-sm text-slate-500">
              Horario
            </p>

            <p className="font-semibold">
              {cell.hour}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Estado
            </p>

            <p className="font-semibold capitalize">
              {cell.status}
            </p>
          </div>

        </div>
      )}
    </Modal>
  );
}