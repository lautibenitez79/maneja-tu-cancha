import type { CalendarDay } from "../types/calendar.types";

interface Props {
  days: CalendarDay[];
}

export default function CalendarHeader({
  days,
}: Props) {
  return (
    <>
      <div className="border-r bg-[var(--color-card)]" />

      {days.map((day) => (
        <div
          key={day.date}
          className={`
            flex
            h-16
            items-center
            justify-center
            border-b
            font-semibold
            text-sm
            ${
              day.isToday
                ? "bg-green-50 text-green-700"
                : "text-[var(--color-title)]"
            }
          `}
        >
          {day.title}
        </div>
      ))}
    </>
  );
}