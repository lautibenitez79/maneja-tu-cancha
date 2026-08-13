import type {
  ResourceBlock,
} from "../types/resource-block.types";

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

export function isSlotBlocked(
  resourceBlocks: ResourceBlock[],
  slotStart: string,
  slotEnd: string,
) {
  const slotStartMinutes =
    timeToMinutes(slotStart);

  const slotEndMinutes =
    timeToMinutes(slotEnd);

  return resourceBlocks.some(
    (block) => {
      const blockStartMinutes =
        timeToMinutes(
          block.starts_at.substring(
            11,
            16,
          ),
        );

      const blockEndMinutes =
        timeToMinutes(
          block.ends_at.substring(
            11,
            16,
          ),
        );

      return (
        blockStartMinutes <
          slotEndMinutes &&
        blockEndMinutes >
          slotStartMinutes
      );
    },
  );
}