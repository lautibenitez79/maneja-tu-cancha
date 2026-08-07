import CalendarCell from "./CalendarCell";
import CalendarHeader from "./CalendarHeader";
import CalendarHour from "./CalendarHour";

import type {
  CalendarCell as CalendarCellType,
  CalendarWeek,
} from "../types/calendar.types";

interface Props {

  week: CalendarWeek;

  onCellClick(
    cell: CalendarCellType,
  ): void;

}

export default function WeeklyCalendar({

  week,

  onCellClick,

}: Props) {

  if (week.days.length === 0) {
    return null;
  }

  const rows =
    week.days[0].cells.length;

  return (

    <div
      className="grid"
      style={{
        gridTemplateColumns:
          "100px repeat(7,1fr)",
      }}
    >

      <CalendarHeader
        days={week.days}
      />

      {Array.from({
        length: rows,
      }).map((_, row) => (

        <>

          <CalendarHour
            key={`hour-${row}`}
            hour={
              week.days[0]
                .cells[row]
                .hour
            }
          />

          {week.days.map(day => (

            <CalendarCell

              key={`${day.date}-${row}`}

              cell={day.cells[row]}

              onClick={onCellClick}

            />

          ))}

        </>

      ))}

    </div>

  );

}