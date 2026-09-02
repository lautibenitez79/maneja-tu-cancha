import { resourceService } from "@/features/resources/services/resource.service";
import { workingHoursService } from "@/features/resources/services/working-hours.service";
import { reservationService } from "./reservation.service";
import { resourceBlockService } from "./resource-block.service";
import { AvailabilityEngine } from "../engine/AvailabilityEngine";
import type { AvailabilityWeek } from "../types/availability.types";
import { startOfWeek, addDays, format } from "date-fns";
import { clubService } from "@/features/clubs/services/club.service";

class AvailabilityService {
  private engine = new AvailabilityEngine();

  async getWeek(
    resourceId: string,
    weekStart: Date,
  ): Promise<AvailabilityWeek> {
    const resource = await resourceService.getById(resourceId);

    const workingHours = await workingHoursService.list(
      resourceId,
    );

    const club = await clubService.getClub(
      resource.club_id,
    );

    if (!club) {
      throw new Error(
        "No se encontró el club del recurso.",
      );
    }

    const monday = startOfWeek(
      weekStart,
      {
        weekStartsOn: 1,
      },
    );

    const sunday = addDays(
      monday,
      6,
    );

    const mondayDate = format(
      monday,
      "yyyy-MM-dd",
    );

    const sundayDate = format(
      sunday,
      "yyyy-MM-dd",
    );

    const reservations =
      await reservationService.listByWeek(
        resourceId,
        mondayDate,
        sundayDate,
        club.timezone,
      );

    const resourceBlocks =
      await resourceBlockService.listByWeek(
        resourceId,
        mondayDate,
        sundayDate,
        club.timezone,
      );

    return this.engine.generateWeek({
      resourceId,
      weekStart: monday,
      reservationDuration:
        resource.reservation_duration,
      capacity: resource.capacity,
      workingHours,
      reservations,
      resourceBlocks,
      timezone: club.timezone,
    });
  }
}

export const availabilityService =
  new AvailabilityService();