import type {
  Reservation,
} from "../types/reservation.types";

import {
  hasReservationCollision,
} from "./hasReservationCollision";

export function canCreateReservation(

  reservations: Reservation[],

  startsAt: string,

  endsAt: string,

) {

  if (

    hasReservationCollision(

      reservations,

      startsAt,

      endsAt,

    )

  ) {

    throw new Error(

      "Ese horario ya se encuentra reservado.",

    );

  }

}