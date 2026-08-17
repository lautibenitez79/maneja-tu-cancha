import { useState } from "react";

import TimeGrid from "./TimeGrid";

import type { DaySchedule } from "../../types/schedule.types";

import { updateRange } from "../../utils/selection";

import { rangeToIndexes } from "../../utils/range";

import type { SelectionState } from "../../types/selection.types";

import { TIME_SLOTS, END_TIME } from "../../utils/timeSlots";

interface Props {
  day: string;

  value: DaySchedule;

  onChange(value: DaySchedule): void;
}

export default function DayColumn({ day, value, onChange }: Props) {
  const [selection, setSelection] = useState<SelectionState>({
    mode: "primary",
  });

  const schedule = value;

  const status =
    selection.mode === "primary"
      ? "Seleccioná el horario principal"
      : "Seleccioná el segundo bloque (opcional)";

  const primaryIndexes = rangeToIndexes(schedule.primary);

  const secondaryIndexes = rangeToIndexes(schedule.secondary);

  function handleSelect(index: number) {
    if (selection.mode === "primary") {
      const nextPrimary = updateRange(schedule.primary, index);

      onChange({
        ...schedule,
        primary: nextPrimary,
      });

      /*
       * Si seleccionamos desde 00:00
       * hasta 23:30, significa:
       *
       * 00:00 → 00:00
       *
       * es decir, las 24 horas.
       *
       * En ese caso NO pasamos al segundo bloque.
       */
      const isFullDay = nextPrimary.start === 0 && nextPrimary.end === END_TIME;

      if (nextPrimary.end !== null && !isFullDay) {
        setSelection({
          mode: "secondary",
        });
      }

      return;
    }

    const nextSecondary = updateRange(schedule.secondary, index);

    onChange({
      ...schedule,
      secondary: nextSecondary,
    });

    if (nextSecondary.end !== null) {
      setSelection({
        mode: "primary",
      });
    }
  }

  function formatRange(start: number | null, end: number | null) {
    if (start === null || end === null) {
      return null;
    }

    if (start === 0 && end === END_TIME) {
      return "00:00 → 00:00";
    }

    const endLabel = end === END_TIME ? "00:00" : TIME_SLOTS[end];

    return `${TIME_SLOTS[start]} → ${endLabel}`;
  }

  const isFullDay =
    schedule.primary.start === 0 && schedule.primary.end === END_TIME;

  return (
    <div className="rounded-[var(--radius-card)] border bg-[var(--color-card)] p-5">
      <h3 className="mb-5 text-center font-semibold">{day}</h3>

      <p className="mb-5 mt-2 text-center text-xs text-slate-500">
        {isFullDay ? "Disponible las 24 horas" : status}
      </p>

      <TimeGrid
        primaryIndexes={primaryIndexes}
        secondaryIndexes={secondaryIndexes}
        onSelect={handleSelect}
      />

      {(schedule.primary.end !== null || schedule.secondary.end !== null) && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              onChange({
                primary: {
                  start: null,
                  end: null,
                },

                secondary: {
                  start: null,
                  end: null,
                },
              });

              setSelection({
                mode: "primary",
              });
            }}
            className="w-full rounded-lg border py-2 text-sm"
          >
            Reiniciar horario
          </button>
        </div>
      )}

      <div className="mt-4 space-y-1 text-xs text-slate-500">
        {formatRange(schedule.primary.start, schedule.primary.end) && (
          <p>
            Principal:{" "}
            {formatRange(schedule.primary.start, schedule.primary.end)}
          </p>
        )}

        {formatRange(schedule.secondary.start, schedule.secondary.end) && (
          <p>
            Segundo bloque:{" "}
            {formatRange(schedule.secondary.start, schedule.secondary.end)}
          </p>
        )}
      </div>
    </div>
  );
}
