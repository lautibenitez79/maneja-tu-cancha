import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type { ReservationTracking } from "../types/reservation-tracking.types";

interface ReservationAttendanceProps {
  reservation: ReservationTracking;
  saving: boolean;
  onSave: (
    attendance: "attended" | "no_show",
    reason: string | null,
  ) => Promise<void>;
}

export function ReservationAttendance({
  reservation,
  saving,
  onSave,
}: ReservationAttendanceProps) {
  const [selectedAttendance, setSelectedAttendance] =
    useState<"attended" | "no_show" | "">(
      reservation.attendance_status ?? "",
    );

  const [reason, setReason] = useState(
    reservation.no_show_reason ?? "",
  );

  useEffect(() => {
    setSelectedAttendance(
      reservation.attendance_status ?? "",
    );

    setReason(
      reservation.no_show_reason ?? "",
    );
  }, [
    reservation.id,
    reservation.attendance_status,
    reservation.no_show_reason,
  ]);

  async function handleChange(
    value: "attended" | "no_show",
  ) {
    setSelectedAttendance(value);

    if (value === "attended") {
      await onSave("attended", null);
    }
  }

  async function handleSaveNoShow() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      return;
    }

    await onSave(
      "no_show",
      trimmedReason,
    );
  }

  return (
    <div className="w-full min-w-0 space-y-2 sm:min-w-[190px]">
      <select
        value={selectedAttendance}
        disabled={saving}
        onChange={(event) => {
          const value = event.target.value;

          if (!value) {
            return;
          }

          void handleChange(
            value as "attended" | "no_show",
          );
        }}
        className="h-10 w-full rounded-lg border bg-card px-2 text-sm"
      >
        <option value="">
          Pendiente
        </option>

        <option value="attended">
          Asistió
        </option>

        <option value="no_show">
          No asistió
        </option>
      </select>

      {selectedAttendance === "no_show" && (
        <div className="space-y-2">
          <textarea
            value={reason}
            disabled={saving}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Motivo de no asistencia"
            className="min-h-20 w-full resize-none rounded-lg border bg-transparent p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          />

          <button
            type="button"
            disabled={
              saving ||
              !reason.trim()
            }
            onClick={() =>
              void handleSaveNoShow()
            }
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border px-3 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}

            Guardar motivo
          </button>
        </div>
      )}
    </div>
  );
}