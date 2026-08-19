import {
  addDays,
  format,
  parseISO,
} from "date-fns";

import {
  formatInTimeZone,
  fromZonedTime,
} from "date-fns-tz";

const DEFAULT_TIMEZONE =
  "America/Argentina/Buenos_Aires";

export function utcToLocalDateTime(
  value: string,
  timezone = DEFAULT_TIMEZONE,
): string {
  return formatInTimeZone(
    value,
    timezone,
    "yyyy-MM-dd'T'HH:mm",
  );
}

export function localDateTimeToUtc(
  value: string,
  timezone = DEFAULT_TIMEZONE,
): string {
  return fromZonedTime(
    value,
    timezone,
  ).toISOString();
}

export function normalizeEndDateTime(
  startsAt: string,
  endsAt: string,
): string {
  /*
   * Normalmente:
   *
   * 14:00 → 15:00
   *
   * Pero cuando tenemos:
   *
   * 23:00 → 00:00
   *
   * el 00:00 pertenece al día siguiente.
   */

  if (endsAt > startsAt) {
    return endsAt;
  }

  const parsedEnd = parseISO(endsAt);

  if (Number.isNaN(parsedEnd.getTime())) {
    throw new Error(
      "El horario de fin no es válido.",
    );
  }

  return format(
    addDays(parsedEnd, 1),
    "yyyy-MM-dd'T'HH:mm:ss",
  );
}