import CalendarCell from "./CalendarCell";
import CalendarHeader from "./CalendarHeader";
import CalendarHour from "./CalendarHour";

import type {
  CalendarCell as CalendarCellType,
  CalendarWeek,
} from "../types/calendar.types";

import React, { Fragment } from "react";

interface Props {
  week: CalendarWeek;
  onCellClick(cell: CalendarCellType): void;
  isGym?: boolean;
}

function WeeklyCalendar({
  week,
  onCellClick,
  isGym = false,
}: Props) {
  if (week.days.length === 0) {
    return null;
  }

  /*
   * Obtenemos todos los horarios que existen
   * durante la semana.
   */
  const hours = Array.from(
    new Set(
      week.days.flatMap((day) =>
        day.cells.map((cell) => cell.hour),
      ),
    ),
  );

  /*
   * Ordenamos los horarios cronológicamente.
   */
  hours.sort((a, b) => {
    const [aHour, aMinute] = a
      .split(":")
      .map(Number);

    const [bHour, bMinute] = b
      .split(":")
      .map(Number);

    return (
      aHour * 60 +
      aMinute -
      (bHour * 60 + bMinute)
    );
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl border">
      <div
        className="grid min-w-[900px] bg-[var(--color-card)]"
        style={{
          gridTemplateColumns:
            "100px repeat(7, minmax(110px, 1fr))",
        }}
      >
        <CalendarHeader days={week.days} />

        {hours.map((hour) => {
          /*
           * Buscamos una celda real de cualquier día
           * para conocer el horario de finalización.
           *
           * Por ejemplo:
           * 13:00 -> 14:00
           */
          const referenceCell =
            week.days
              .flatMap((day) => day.cells)
              .find(
                (cell) =>
                  cell.hour === hour,
              );

          return (
            <Fragment key={hour}>
              <CalendarHour hour={hour} />

              {week.days.map((day) => {
                const cell = day.cells.find(
                  (dayCell) =>
                    dayCell.hour === hour,
                );

                /*
                 * Si el día tiene ese horario,
                 * usamos la celda real.
                 *
                 * Esto conserva todos los estados
                 * originales:
                 * Disponible
                 * Reservado
                 * Pendiente
                 * Bloqueado
                 */
                if (cell) {
                  return (
                    <CalendarCell
                      key={`${day.date}-${hour}`}
                      cell={cell}
                      onClick={onCellClick}
                      isGym={isGym}
                    />
                  );
                }

                /*
                 * Si el día NO tiene ese horario,
                 * mostramos una celda CERRADA.
                 *
                 * NO usamos un div gris.
                 * Usamos exactamente la misma estructura
                 * visual que CalendarCell.
                 */
                return (
                  <button
                    key={`${day.date}-${hour}`}
                    type="button"
                    disabled
                    className="h-16 w-full border-b border-r bg-[var(--color-card)] px-2 transition flex flex-col items-center justify-center gap-1 text-slate-400 cursor-not-allowed opacity-70"
                  >
                    <span className="text-xs font-medium opacity-70">
                      {hour}
                      {" → "}
                      {referenceCell
                        ? referenceCell.ends_at.substring(
                            11,
                            16,
                          )
                        : ""}
                    </span>

                    <span className="text-sm">
                      Cerrado
                    </span>
                  </button>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(
  WeeklyCalendar,
);