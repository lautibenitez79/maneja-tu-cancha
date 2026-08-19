import type {
  Reservation,
} from "../types/reservation.types";

import type {
  WorkingHour,
} from "@/features/resources/types/working-hours.types";

import {
  isSlotOpen,
} from "./isSlotOpen";

import {
  isSlotReserved,
} from "./isSlotReserved";

import type {
  ResourceBlock,
} from "../types/resource-block.types";

import {
  isSlotBlocked,
} from "./isSlotBlocked";

export function getSlotStatus(
  slotStart: string,
  slotEnd: string,
  workingHour: WorkingHour,
  reservations: Reservation[],
  resourceBlocks: ResourceBlock[],
  timezone: string,
) {
  /*
   * FUERA DEL HORARIO DE FUNCIONAMIENTO
   */
  if (
    !isSlotOpen(
      workingHour,
      slotStart,
      slotEnd,
    )
  ) {
    return {
      status: "closed",
      clickable: false,
    } as const;
  }

  /*
   * BLOQUEO MANUAL
   */
  const blocked =
    isSlotBlocked(
      resourceBlocks,
      slotStart,
      slotEnd,
      timezone,
    );

  if (blocked) {
    return {
      status: "blocked",
      clickable: true,
      resourceBlockId: blocked.id,
    } as const;
  }

  /*
   * RESERVA
   */
  const reservation =
    isSlotReserved(
      reservations,
      slotStart,
      slotEnd,
      timezone,
    );

  if (!reservation) {
    return {
      status: "available",
      clickable: true,
    } as const;
  }

  /*
   * RESERVA CANCELADA
   * El horario vuelve a estar disponible.
   */
  if (
    reservation.status ===
    "cancelled"
  ) {
    return {
      status: "available",
      clickable: true,
    } as const;
  }

  /*
   * RESERVA ACTIVA
   */
  return {
    status:
      reservation.status ===
      "pending_payment"
        ? "pending_payment"
        : "reserved",

    clickable: true,

    reservationId:
      reservation.id,
  } as const;
}