import { resourceService } from "@/features/resources/services/resource.service";
import { availabilityService } from "@/features/reservations/services/availability.service";

class CalendarService {

  async getWeek(

    clubId: string,

    weekStart: Date,

  ) {

    const resources =
      await resourceService.list(clubId);

    const result = [];

    for (const resource of resources) {

      const week =
        await availabilityService.getWeek(

          resource.id,

          weekStart,

        );

      result.push({

        resource,

        week,

      });

    }

    return result;

  }

}

export const calendarService =
  new CalendarService();