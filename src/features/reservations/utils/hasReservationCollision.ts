import type {
  Reservation,
} from "../types/reservation.types";

function toTimestamp(
  value: string,
): number {
  return new Date(value).getTime();
}

export function hasReservationCollision(

  reservations: Reservation[],

  startsAt: string,

  endsAt: string,

) {

  const newStart =
    toTimestamp(startsAt);

  const newEnd =
    toTimestamp(endsAt);

  return reservations.some(
    reservation => {

      const reservationStart =
        toTimestamp(
          reservation.starts_at,
        );

      const reservationEnd =
        toTimestamp(
          reservation.ends_at,
        );

      return (
        newStart <
          reservationEnd &&
        newEnd >
          reservationStart
      );

    },
  );

}