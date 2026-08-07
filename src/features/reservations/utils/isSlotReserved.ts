import type { Reservation } from "../types/reservation.types";

export function isSlotReserved(

  reservations: Reservation[],

  slotStart: string,

  slotEnd: string,

) {

  return reservations.find((reservation) =>

    reservation.starts_at < slotEnd &&
    reservation.ends_at > slotStart

  );

}