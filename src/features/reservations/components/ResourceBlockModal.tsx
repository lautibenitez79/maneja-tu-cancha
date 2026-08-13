import { useState } from "react";
import { toast } from "sonner";

import Modal from "@/components/ui/Modal";

import type { CalendarCell } from "@/features/calendar/types/calendar.types";

import { resourceBlockService } from "../services/resource-block.service";

interface Props {
  open: boolean;

  cell: CalendarCell ;

  resourceId: string;

  onClose(): void;

  onCreated(): Promise<void>;
}

export default function ResourceBlockModal({
  open,
  cell,
  resourceId,
  onClose,
  onCreated,
}: Props) {

  const [reason, setReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  if (!cell) {
    return null;
  }

  async function handleCreate() {

    if (!reason.trim()) {

      toast.error(
        "Ingresá un motivo para el bloqueo.",
      );

      return;
    }

    try {

      setSaving(true);

      await resourceBlockService.create(
        resourceId,
        cell.starts_at,
        cell.ends_at,
        reason.trim(),
      );

      toast.success(
        "Horario bloqueado correctamente.",
      );

      setReason("");

      await onCreated();

      onClose();

    } catch (error) {

      if (error instanceof Error) {

        toast.error(
          error.message,
        );

      } else {

        toast.error(
          "No se pudo bloquear el horario.",
        );

      }

    } finally {

      setSaving(false);

    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bloquear horario"
    >

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
          <label
            htmlFor="block-reason"
            className="mb-1 block text-sm text-slate-500"
          >
            Motivo
          </label>

          <input
            id="block-reason"
            type="text"
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value,
              )
            }
            placeholder="Ej. Mantenimiento"
            className="w-full rounded-lg border px-3 py-2"
            disabled={saving}
          />
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {saving
            ? "Bloqueando..."
            : "Bloquear horario"}
        </button>

      </div>

    </Modal>
  );
}