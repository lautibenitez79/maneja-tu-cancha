import {
  addDays,
  parse,
  format,
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
  if (endsAt > startsAt) {
    return endsAt;
  }

  const parsed = parse(
    endsAt,
    "yyyy-MM-dd'T'HH:mm",
    new Date(),
  );

  return format(
    addDays(parsed, 1),
    "yyyy-MM-dd'T'HH:mm",
  );
}