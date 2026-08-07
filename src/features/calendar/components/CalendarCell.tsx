import clsx from "clsx";

import type {

  CalendarCell as Cell,

} from "../types/calendar.types";

interface Props {

  cell: Cell;

  onClick(
    cell: Cell,
  ): void;

}

export default function CalendarCell({

  cell,
  
  onClick,

}: Props) {

  return (

    <button

        disabled={!cell.clickable}

        onClick={() => onClick(cell)}

      className={clsx(

        "h-14 w-full border-b border-r transition",

        {

          "bg-green-50 hover:bg-green-100":

            cell.status === "available",

          "bg-red-100":

            cell.status === "reserved",

          "bg-yellow-100":

            cell.status === "pending_payment",

          "bg-slate-100":

            cell.status === "closed",

        },

      )}

    >

      {

        cell.status === "available"

          ? "Disponible"

          : cell.status === "reserved"

          ? "Reservado"

          : cell.status === "pending_payment"

          ? "Pendiente"

          : "Cerrado"

      }

    </button>

  );

}