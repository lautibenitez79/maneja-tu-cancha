import type { Reservation } from "../types/reservation.types";

import type { WorkingHour } from "@/features/resources/types/working-hours.types";

import { isSlotOpen } from "./isSlotOpen";
import { isSlotReserved } from "./isSlotReserved";
import type { ResourceBlock } from "../types/resource-block.types";
import { isSlotBlocked } from "./isSlotBlocked";

export function getSlotStatus(
  slotStart: string,
  slotEnd: string,
  workingHour: WorkingHour,
  reservations: Reservation[],
  resourceBlocks: ResourceBlock[],
) {
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

  const blocked = isSlotBlocked(resourceBlocks, slotStart, slotEnd);

  if (blocked) {
    return {
      status: "closed",
      clickable: false,
    } as const;
  }

  const reservation = isSlotReserved(reservations, slotStart, slotEnd);

  if (!reservation) {
    return {
      status: "available",
      clickable: true,
    } as const;
  }

  if (reservation.status === "cancelled") {
    return {
      status: "available",
      clickable: true,
    } as const;
  }

  return {
    status:
      reservation.status === "pending_payment" ? "pending_payment" : "reserved",

    clickable: true,

    reservationId: reservation.id,
  } as const;
}
