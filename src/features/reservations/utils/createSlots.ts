export interface Slot {
  starts_at: string;
  ends_at: string;
}

const MINUTES_IN_DAY = 24 * 60;

function minutesToTime(
  totalMinutes: number,
): string {
  if (totalMinutes === MINUTES_IN_DAY) {
    return "00:00";
  }

  const normalized =
    totalMinutes % MINUTES_IN_DAY;

  const hours = Math.floor(
    normalized / 60,
  );

  const minutes =
    normalized % 60;

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
): Slot[] {
  if (!duration || duration <= 0) {
    return [];
  }

  const slots: Slot[] = [];

  for (
    let current = 0;
    current + duration <= MINUTES_IN_DAY;
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