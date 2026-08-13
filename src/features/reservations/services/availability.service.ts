import { resourceService } from "@/features/resources/services/resource.service";

import { workingHoursService } from "@/features/resources/services/working-hours.service";

import { reservationService } from "./reservation.service";
import { resourceBlockService } from "./resource-block.service";

import { AvailabilityEngine } from "../engine/AvailabilityEngine";

import type {
  AvailabilityWeek,
} from "../types/availability.types";

import {
  startOfWeek,
  addDays,
  format,
} from "date-fns";

class AvailabilityService {
  private engine =
    new AvailabilityEngine();

  async getWeek(
    resourceId: string,
    weekStart: Date,
  ): Promise<AvailabilityWeek> {
    const resource =
      await resourceService.getById(
        resourceId,
      );

    const workingHours =
      await workingHoursService.list(
        resourceId,
      );

    const monday =
      startOfWeek(
        weekStart,
        {
          weekStartsOn: 1,
        },
      );

    const sunday =
      addDays(
        monday,
        6,
      );

    const mondayDate =
      format(
        monday,
        "yyyy-MM-dd",
      );

    const sundayDate =
      format(
        sunday,
        "yyyy-MM-dd",
      );

    const reservations =
      await reservationService.listByWeek(
        resourceId,
        `${mondayDate}T00:00:00`,
        `${sundayDate}T23:59:59`,
      );

    const resourceBlocks =
      await resourceBlockService.listByWeek(
        resourceId,
        `${mondayDate}T00:00:00`,
        `${sundayDate}T23:59:59`,
      );

    return this.engine.generateWeek({
      resourceId,

      weekStart: monday,

      reservationDuration:
        resource.reservation_duration,

      workingHours,

      reservations,

      resourceBlocks,
    });
  }
}

export const availabilityService =
  new AvailabilityService();