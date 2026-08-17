import type {
  ResourceBlock,
} from "../types/resource-block.types";

import {
  formatInTimeZone,
} from "date-fns-tz";

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

  return (
    hours * 60 +
    minutes
  );
}

export function isSlotBlocked(
  resourceBlocks: ResourceBlock[],
  slotStart: string,
  slotEnd: string,
  timezone: string,
): ResourceBlock | null {
  const slotStartMinutes =
    timeToMinutes(slotStart);

  let slotEndMinutes =
    timeToMinutes(slotEnd);

  if (
    slotEndMinutes === 0 &&
    slotStartMinutes > 0
  ) {
    slotEndMinutes =
      24 * 60;
  }

  const block =
    resourceBlocks.find(
      (block) => {
        const blockStart =
          formatInTimeZone(
            block.starts_at,
            timezone,
            "HH:mm",
          );

        const blockEnd =
          formatInTimeZone(
            block.ends_at,
            timezone,
            "HH:mm",
          );

        const blockStartMinutes =
          timeToMinutes(
            blockStart,
          );

        let blockEndMinutes =
          timeToMinutes(
            blockEnd,
          );

        if (
          blockEndMinutes === 0 &&
          blockStartMinutes > 0
        ) {
          blockEndMinutes =
            24 * 60;
        }

        return (
          blockStartMinutes <
            slotEndMinutes &&
          blockEndMinutes >
            slotStartMinutes
        );
      },
    );

  return block ?? null;
}