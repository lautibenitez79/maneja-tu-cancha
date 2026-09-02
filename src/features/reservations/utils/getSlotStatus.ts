import type {
  Reservation,
} from "../types/reservation.types";

import type {
  WorkingHour,
} from "@/features/resources/types/working-hours.types";

import {
  isSlotOpen,
} from "./isSlotOpen";

import type {
  ResourceBlock,
} from "../types/resource-block.types";

import {
  isSlotBlocked,
} from "./isSlotBlocked";

import {
  parseISO,
} from "date-fns";

import {
  fromZonedTime,
} from "date-fns-tz";

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
   * RESERVAS
   *
   * Puede haber más de una persona
   * ocupando el mismo horario cuando
   * el recurso tiene capacidad > 1.
   */
  const slotStartUtc = fromZonedTime(
    parseISO(slotStart),
    timezone,
  );

  const slotEndUtc = fromZonedTime(
    parseISO(slotEnd),
    timezone,
  );

  const overlappingReservations =
    reservations.filter((reservation) => {
      if (
        reservation.status ===
        "cancelled"
      ) {
        return false;
      }

      const reservationStart =
        new Date(reservation.starts_at);

      const reservationEnd =
        new Date(reservation.ends_at);

      return (
        reservationStart <
          slotEndUtc &&
        reservationEnd >
          slotStartUtc
      );
    });

  /*
   * SIN RESERVAS
   */
  if (
    overlappingReservations.length ===
    0
  ) {
    return {
      status: "available",
      clickable: true,
    } as const;
  }

  /*
   * RESERVAS ACTIVAS
   */
  const hasPendingPayment =
    overlappingReservations.some(
      (reservation) =>
        reservation.status ===
        "pending_payment",
    );

  return {
    status: hasPendingPayment
      ? "pending_payment"
      : "reserved",

    clickable: true,

    /*
     * Compatibilidad con el código actual.
     * ReservationModal sigue usando
     * reservationId.
     */
    reservationId:
      overlappingReservations[0].id,

    /*
     * Todas las reservas del horario.
     */
    reservationIds:
      overlappingReservations.map(
        (reservation) =>
          reservation.id,
      ),

    /*
     * Todos los nombres para mostrar
     * en la celda del calendario.
     */
    reservationNames:
      overlappingReservations.map(
        (reservation) =>
          reservation.customer_name,
      ),
  } as const;
}