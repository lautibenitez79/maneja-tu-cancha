import type { Reservation } from "../types/reservation.types";

export function hasReservationCollision(

  reservations: Reservation[],

  startsAt: string,

  endsAt: string,

) {

  return reservations.some(

    reservation =>

      startsAt < reservation.ends_at &&
      endsAt > reservation.starts_at,

  );

}