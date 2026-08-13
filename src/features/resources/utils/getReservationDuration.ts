import type { ResourceType } from "../types/resource.types";

export function getReservationDuration(
  type: ResourceType,
): number {
  return type === "padel" ? 90 : 60;
}