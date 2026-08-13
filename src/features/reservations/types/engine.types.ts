import type { Reservation } from "./reservation.types";
import type { ResourceBlock } from "./resource-block.types";

import type {
  WorkingHour,
} from "@/features/resources/types/working-hours.types";

export interface GenerateDayInput {
  workingHour: WorkingHour;

  reservations: Reservation[];

  resourceBlocks: ResourceBlock[];

  reservationDuration: number;

  date: string;
}

export interface GenerateWeekInput {
  resourceId: string;

  weekStart: Date;

  reservationDuration: number;

  workingHours: WorkingHour[];

  reservations: Reservation[];

  resourceBlocks: ResourceBlock[];
}