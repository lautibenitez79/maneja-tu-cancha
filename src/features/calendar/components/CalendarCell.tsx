import clsx from "clsx";

import type { CalendarCell as Cell } from "../types/calendar.types";

import React from "react";

interface Props {
  cell: Cell;

  onClick(cell: Cell): void;
}

function CalendarCell({ cell, onClick }: Props) {
  const statusLabel =
    cell.status === "available"
      ? "Disponible"
      : cell.status === "reserved"
        ? "Reservado"
        : cell.status === "pending_payment"
          ? "Pendiente"
          : cell.status === "blocked"
            ? "Bloqueado"
            : "Cerrado";

  const reservationNames = cell.reservationNames ?? [];

  return (
    <button
      disabled={!cell.clickable}
      onClick={() => onClick(cell)}
      className={clsx(
        "h-16 w-full border-b border-r bg-[var(--color-card)] px-2 transition",
        "flex flex-col items-center justify-center gap-1",
        {
          "cursor-pointer text-[var(--color-title)] hover:bg-green-50 hover:text-green-600":
            cell.status === "available" && cell.clickable,

          "text-red-500": cell.status === "reserved",

          "text-yellow-500": cell.status === "pending_payment",

          "cursor-pointer text-orange-500 hover:bg-orange-50":
            cell.status === "blocked" && cell.clickable,

          "text-slate-400": cell.status === "closed",

          "cursor-not-allowed opacity-70": !cell.clickable,
        },
      )}
    >
      <span className="text-xs font-medium opacity-70">
        {cell.starts_at.substring(11, 16)}

        {" → "}

        {cell.ends_at.substring(11, 16)}
      </span>

      {reservationNames.length > 0 ? (
        <div className="max-w-full text-center text-xs leading-tight">
          {reservationNames.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="truncate"
              title={name}
            >
              {name}
            </div>
          ))}
        </div>
      ) : (
        <span className="text-sm">{statusLabel}</span>
      )}
    </button>
  );
}

export default React.memo(CalendarCell);