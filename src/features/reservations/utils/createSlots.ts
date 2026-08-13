export interface Slot {
  starts_at: string;
  ends_at: string;
}

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

  return hours * 60 + minutes;
}

function minutesToTime(
  totalMinutes: number,
): string {
  const hours =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;

  return `${String(hours).padStart(
    2,
    "0",
  )}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

export function createSlots(
  duration: number,
  opensAt: string,
): Slot[] {
  if (!duration || duration <= 0) {
    return [];
  }

  const startMinutes =
    timeToMinutes(opensAt);

  const minutesInDay =
    24 * 60;

  const slots: Slot[] = [];

  for (
    let current = startMinutes;
    current + duration <= minutesInDay;
    current += duration
  ) {
    slots.push({
      starts_at:
        minutesToTime(current),

      ends_at:
        minutesToTime(
          current + duration,
        ),
    });
  }

  return slots;
}