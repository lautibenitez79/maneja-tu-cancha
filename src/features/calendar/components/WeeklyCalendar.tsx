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

  const rows = week.days[0].cells.length;

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

        {Array.from({ length: rows }).map(
          (_, row) => (
            <Fragment key={row}>
              <CalendarHour
                hour={
                  week.days[0]
                    .cells[row].hour
                }
              />

              {week.days.map((day) => (
                <CalendarCell
                  key={`${day.date}-${row}`}
                  cell={day.cells[row]}
                  onClick={onCellClick}
                  isGym={isGym}
                />
              ))}
            </Fragment>
          ),
        )}
      </div>
    </div>
  );
}

export default React.memo(
  WeeklyCalendar,
);