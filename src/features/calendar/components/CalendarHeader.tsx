import type {

  CalendarDay,

} from "../types/calendar.types";

interface Props {

  days: CalendarDay[];

}

export default function CalendarHeader({

  days,

}: Props) {

  return (

    <>

      <div className="border-r" />

      {

        days.map(day => (

          <div

            key={day.date}

            className={`
              flex
              h-16
              items-center
              justify-center
              border-b
              font-semibold

              ${

                day.isToday

                  ? "bg-blue-50 text-blue-600"

                  : ""

              }
            `}
          >

            {day.title}

          </div>

        ))

      }

    </>

  );

}