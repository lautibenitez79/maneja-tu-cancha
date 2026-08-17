import type {
  Reservation,
} from "../types/reservation.types";

import {
  formatInTimeZone,
} from "date-fns-tz";

function timeToMinutes(
  time: string,
): number {
  const [
    hours,
    minutes,
  ] = time
    .substring(0, 5)
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

export function isSlotReserved(
  reservations: Reservation[],
  slotStart: string,
  slotEnd: string,
  timezone: string,
) {
  const slotStartMinutes =
    timeToMinutes(
      slotStart,
    );

  let slotEndMinutes =
    timeToMinutes(
      slotEnd,
    );

  if (
    slotEndMinutes === 0 &&
    slotStartMinutes > 0
  ) {
    slotEndMinutes =
      24 * 60;
  }

  return reservations.find(
    (reservation) => {
      const reservationStart =
        formatInTimeZone(
          reservation.starts_at,
          timezone,
          "HH:mm",
        );

      const reservationEnd =
        formatInTimeZone(
          reservation.ends_at,
          timezone,
          "HH:mm",
        );

      const reservationStartMinutes =
        timeToMinutes(
          reservationStart,
        );

      let reservationEndMinutes =
        timeToMinutes(
          reservationEnd,
        );

      if (
        reservationEndMinutes === 0 &&
        reservationStartMinutes > 0
      ) {
        reservationEndMinutes =
          24 * 60;
      }

      return (
        reservationStartMinutes <
          slotEndMinutes &&
        reservationEndMinutes >
          slotStartMinutes
      );
    },
  );
}