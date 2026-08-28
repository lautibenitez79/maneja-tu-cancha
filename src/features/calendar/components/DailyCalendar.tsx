import CalendarCell from "./CalendarCell";
import CalendarHour from "./CalendarHour";

import type {
  CalendarCell as CalendarCellType,
  CalendarDay,
} from "../types/calendar.types";

interface Props {
  day: CalendarDay;

  onCellClick(cell: CalendarCellType): void;
}

export default function DailyCalendar({
  day,
  onCellClick,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-[var(--color-card)]">
      <div className="grid grid-cols-[72px_minmax(0,1fr)]">
        <div className="border-b border-r" />

        <div className="flex h-14 items-center justify-center border-b px-3 text-center font-semibold capitalize">
          {day.title}
        </div>

        {day.cells.map((cell) => (
          <div
            key={`${day.date}-${cell.starts_at}`}
            className="contents"
          >
            <CalendarHour
              hour={cell.hour}
            />

            <CalendarCell
              cell={cell}
              onClick={onCellClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}