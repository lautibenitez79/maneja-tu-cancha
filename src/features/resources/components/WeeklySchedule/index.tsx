import type { DaySchedule } from "../../types/schedule.types";

import { createEmptyWeek } from "../../utils/createEmptyWeek";

import DayColumn from "./DayColumn";

interface Props {

  value: DaySchedule[];

  onChange(
    value: DaySchedule[]
  ): void;

}

const DAYS = [

  "Lunes",

  "Martes",

  "Miércoles",

  "Jueves",

  "Viernes",

  "Sábado",

  "Domingo",

];

export default function WeeklySchedule({

  value,

  onChange,

}: Props) {

  const week =
    value.length
      ? value
      : createEmptyWeek();

  function updateDay(

    index:number,

    next:DaySchedule

  ){

    const copy=[...week];

    copy[index]=next;

    onChange(copy);

  }

  return(

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">

      {

        DAYS.map((day,index)=>(

          <DayColumn

            key={day}

            day={day}

            value={week[index]}

            onChange={(next)=>

              updateDay(

                index,

                next

              )

            }

          />

        ))

      }

    </div>

  );

}