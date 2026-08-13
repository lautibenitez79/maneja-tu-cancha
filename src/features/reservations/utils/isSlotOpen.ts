import type {
  WorkingHour,
} from "@/features/resources/types/working-hours.types";

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

function isInsideRange(
  slotStart: number,
  slotEnd: number,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  return (
    slotStart >= rangeStart &&
    slotEnd <= rangeEnd
  );
}

export function isSlotOpen(
  workingHour: WorkingHour,
  slotStart: string,
  slotEnd: string,
) {
  if (!workingHour.enabled) {
    return false;
  }

  const start =
    timeToMinutes(slotStart);

  let end =
    timeToMinutes(slotEnd);

  const open =
    timeToMinutes(
      workingHour.opens_at,
    );

  let close =
    timeToMinutes(
      workingHour.closes_at,
    );

  // 00:00 representa el final del día
  // cuando el slot comenzó antes de medianoche.
  if (
    end === 0 &&
    start > 0
  ) {
    end = 24 * 60;
  }

  if (
    close === 0 &&
    open > 0
  ) {
    close = 24 * 60;
  }

  if (
    isInsideRange(
      start,
      end,
      open,
      close,
    )
  ) {
    return true;
  }

  if (
    workingHour.reopens_at &&
    workingHour.final_closes_at
  ) {
    const reopen =
      timeToMinutes(
        workingHour.reopens_at,
      );

    let finalClose =
      timeToMinutes(
        workingHour.final_closes_at,
      );

    if (
      finalClose === 0 &&
      reopen > 0
    ) {
      finalClose = 24 * 60;
    }

    return isInsideRange(
      start,
      end,
      reopen,
      finalClose,
    );
  }

  return false;
}