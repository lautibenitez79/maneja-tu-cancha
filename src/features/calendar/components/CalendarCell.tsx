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
  const statusLabel =
    cell.status === "available"
      ? "Disponible"
      : cell.status === "reserved"
      ? "Reservado"
      : cell.status === "pending_payment"
      ? "Pendiente"
      : "Cerrado";

  return (
    <button
      disabled={!cell.clickable}
      onClick={() => onClick(cell)}
      className={clsx(
        "h-16 w-full bg-[var(--color-card)] border-b border-r transition flex flex-col items-center justify-center gap-1",
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
      <span className="text-xs font-medium opacity-70">
        {cell.starts_at.substring(11, 16)}
        {" → "}
        {cell.ends_at.substring(11, 16)}
      </span>

      <span className="text-sm">
        {statusLabel}
      </span>
    </button>
  );
}

export default React.memo(CalendarCell);