import type { WorkingHour } from "@/features/resources/types/working-hours.types";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time
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
): boolean {
  if (!workingHour.enabled) {
    return false;
  }

  const start = timeToMinutes(slotStart);

  let end = timeToMinutes(slotEnd);

  const open = timeToMinutes(
    workingHour.opens_at,
  );

  let close = timeToMinutes(
    workingHour.closes_at,
  );

  const minutesInDay = 24 * 60;

  /*
   * Un slot que termina a las 00:00
   * realmente termina a las 24:00 del día.
   */
  if (end === 0 && start > 0) {
    end = minutesInDay;
  }

  /*
   * 00:00 → 00:00 significa:
   * abierto durante las 24 horas.
   */
  const isFullDay =
    open === 0 &&
    close === 0;

  if (isFullDay) {
    return true;
  }

  /*
   * Un horario que termina a las 00:00
   * representa el final del día.
   *
   * Ejemplo:
   * 08:00 → 00:00
   * significa 08:00 → 24:00
   */
  if (close === 0 && open > 0) {
    close = minutesInDay;
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

  /*
   * Segundo bloque.
   */
  if (
    workingHour.reopens_at &&
    workingHour.final_closes_at
  ) {
    const reopen = timeToMinutes(
      workingHour.reopens_at,
    );

    let finalClose = timeToMinutes(
      workingHour.final_closes_at,
    );

    if (
      finalClose === 0 &&
      reopen > 0
    ) {
      finalClose = minutesInDay;
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