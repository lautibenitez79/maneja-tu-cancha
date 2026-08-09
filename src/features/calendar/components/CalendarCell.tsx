import clsx from "clsx";

import type {

  CalendarCell as Cell,

} from "../types/calendar.types";
import React from "react";

interface Props {

  cell: Cell;

  onClick(
    cell: Cell,
  ): void;

}

function CalendarCell({

  cell,
  
  onClick,

}: Props) {

  return (

    <button

        disabled={!cell.clickable}

        onClick={() => onClick(cell)}

      className={clsx(

        "h-14 w-full bg-[var(--color-card)] border-b border-r transition",

        {

          "text-[var(--color-title)] hover:text-green-500 hover:bg-green-50":

            cell.status === "available",

          "text-red-400":

            cell.status === "reserved",

          "text-yellow-400":

            cell.status === "pending_payment",

          "text-black":

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

export default React.memo(CalendarCell);