import { useState } from "react";

import { toast } from "sonner";

import Modal from "@/components/ui/Modal";

import type {
  CalendarCell,
} from "@/features/calendar/types/calendar.types";

import {
  resourceBlockService,
} from "../services/resource-block.service";

import {
  resourceService,
} from "@/features/resources/services/resource.service";

import {
  clubService,
} from "@/features/clubs/services/club.service";

import {
  localDateTimeToUtc,
} from "@/utils/timezone";

interface Props {
  open: boolean;

  cell: CalendarCell;

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

  const isBlocked =
    cell.status === "blocked";

  async function handleCreate() {
    if (!reason.trim()) {
      toast.error(
        "Ingresá un motivo para el bloqueo.",
      );

      return;
    }

    try {
      setSaving(true);

      const resource =
        await resourceService.getById(
          resourceId,
        );

      const club =
        await clubService.getClub(
          resource.club_id,
        );

      if (!club) {
        throw new Error(
          "No se encontró el club del recurso.",
        );
      }

      const startsAt =
        localDateTimeToUtc(
          cell.starts_at,
          club.timezone,
        );

      const endsAt =
        localDateTimeToUtc(
          cell.ends_at,
          club.timezone,
        );

      await resourceBlockService.create(
        resourceId,
        startsAt,
        endsAt,
        reason.trim(),
      );

      toast.success(
        "Horario bloqueado correctamente.",
      );

      setReason("");

      await onCreated();

      onClose();
    } catch (error) {
      if (
        error instanceof Error
      ) {
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

  async function handleRemove() {
    if (!cell.resourceBlockId) {
      toast.error(
        "No se encontró el bloqueo.",
      );

      return;
    }

    try {
      setSaving(true);

      await resourceBlockService.remove(
        cell.resourceBlockId,
      );

      toast.success(
        "Horario desbloqueado correctamente.",
      );

      await onCreated();

      onClose();
    } catch (error) {
      if (
        error instanceof Error
      ) {
        toast.error(
          error.message,
        );
      } else {
        toast.error(
          "No se pudo desbloquear el horario.",
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
      title={
        isBlocked
          ? "Horario bloqueado"
          : "Bloquear horario"
      }
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

        {isBlocked ? (
          <>
            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-sm font-medium text-orange-700">
                Este horario está bloqueado.
              </p>

              <p className="mt-1 text-sm text-orange-600">
                Al desbloquearlo volverá a
                estar disponible para reservas.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Desbloqueando..."
                : "Desbloquear horario"}
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Modal>
  );
}