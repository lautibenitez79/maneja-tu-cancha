import { addDays, format, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import type { Reservation } from "../types/reservation.types";
import type { ResourceBlock } from "../types/resource-block.types";
import type { WorkingHour } from "@/features/resources/types/working-hours.types";

import { isSlotOpen } from "./isSlotOpen";

function toUtcRange(
  slotStart: string,
  slotEnd: string,
  timezone: string,
) {
  const start = fromZonedTime(slotStart, timezone);

  let localEnd = slotEnd;

  const startTime = slotStart.substring(11, 16);
  const endTime = slotEnd.substring(11, 16);

  /*
   * Si el turno cruza medianoche,
   * el final pertenece al día siguiente.
   */
  if (endTime <= startTime) {
    const date = parseISO(slotEnd.substring(0, 10));
    const nextDate = addDays(date, 1);

    localEnd = `${format(nextDate, "yyyy-MM-dd")}T${endTime}:00`;
  }

  const end = fromZonedTime(localEnd, timezone);

  return {
    start,
    end,
  };
}

export function getSlotStatus(
  slotStart: string,
  slotEnd: string,
  workingHour: WorkingHour,
  reservations: Reservation[],
  resourceBlocks: ResourceBlock[],
  capacity: number,
  timezone: string,
) {
  /*
   * 1. HORARIO DE TRABAJO
   */
  if (
    !isSlotOpen(
      workingHour,
      slotStart.substring(11, 16),
      slotEnd.substring(11, 16),
    )
  ) {
    return {
      status: "closed",
      clickable: false,
    } as const;
  }

  /*
   * 2. CONVERTIMOS EL SLOT LOCAL A UTC
   *
   * Las reservas de Supabase están guardadas
   * como timestamptz.
   */
  const {
    start: slotStartUtc,
    end: slotEndUtc,
  } = toUtcRange(slotStart, slotEnd, timezone);

  const slotStartTime = slotStartUtc.getTime();
  const slotEndTime = slotEndUtc.getTime();

  /*
   * 3. BLOQUEOS
   */
  const block = resourceBlocks.find((resourceBlock) => {
    const blockStart = new Date(resourceBlock.starts_at).getTime();
    const blockEnd = new Date(resourceBlock.ends_at).getTime();

    return (
      blockStart < slotEndTime &&
      blockEnd > slotStartTime
    );
  });

  if (block) {
    return {
      status: "blocked",
      clickable: true,
      resourceBlockId: block.id,
    } as const;
  }

  /*
   * 4. TODAS LAS RESERVAS QUE SE SUPERPONEN
   */
  const overlappingReservations = reservations.filter(
    (reservation) => {
      if (reservation.status === "cancelled") {
        return false;
      }

      const reservationStart = new Date(
        reservation.starts_at,
      ).getTime();

      const reservationEnd = new Date(
        reservation.ends_at,
      ).getTime();

      return (
        reservationStart < slotEndTime &&
        reservationEnd > slotStartTime
      );
    },
  );

  /*
   * 5. SIN RESERVAS
   */
  if (overlappingReservations.length === 0) {
    return {
      status: "available",
      clickable: true,
    } as const;
  }

  /*
   * 6. GUARDAMOS TODAS LAS PERSONAS
   *
   * Esto es lo que necesitaba el modal
   * del gimnasio.
   */
  const reservationIds = overlappingReservations.map(
    (reservation) => reservation.id,
  );

  const reservationNames = overlappingReservations.map(
    (reservation) => reservation.customer_name,
  );

  /*
   * 7. TODAVÍA HAY CAPACIDAD
   *
   * Importante para gimnasio:
   * un horario puede estar disponible
   * aunque ya tenga personas anotadas.
   */
  if (
    overlappingReservations.length <
    Math.max(1, capacity)
  ) {
    return {
      status: "available",
      clickable: true,
      reservationId: reservationIds[0],
      reservationIds,
      reservationNames,
    } as const;
  }

  /*
   * 8. CAPACIDAD COMPLETA
   */
  const hasPendingPayment =
    overlappingReservations.some(
      (reservation) =>
        reservation.status === "pending_payment",
    );

  return {
    status: hasPendingPayment
      ? "pending_payment"
      : "reserved",
    clickable: true,
    reservationId: reservationIds[0],
    reservationIds,
    reservationNames,
  } as const;
}