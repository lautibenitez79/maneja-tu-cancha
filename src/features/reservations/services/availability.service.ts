import { resourceService } from "@/features/resources/services/resource.service";
import { workingHoursService } from "@/features/resources/services/working-hours.service";

import { reservationService } from "./reservation.service";
// import { resourceBlockService } from "./resource-block.service";

import { AvailabilityEngine } from "../engine/AvailabilityEngine";

import type {
  AvailabilityWeek,
} from "../types/availability.types";

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
      weekStart
        .toISOString()
        .split("T")[0];

    const sunday =
      new Date(
        weekStart.getTime() +
        6 * 86400000,
      )
        .toISOString()
        .split("T")[0];

    const reservations =
      await reservationService.listByWeek(

        resourceId,

        `${monday}T00:00:00`,

        `${sunday}T23:59:59`,

      );

    // const resourceBlocks =
    // await resourceBlockService.listByWeek(

    //   resourceId,

    //   `${monday}T00:00:00`,

    //   `${sunday}T23:59:59`,

    // );
    const resourceBlocks = [];

    return this.engine.generateWeek({

      weekStart,

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