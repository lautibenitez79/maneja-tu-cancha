import { availabilityService }
from "@/features/reservations/services/availability.service";

import { mapAvailabilityToCalendar }
from "../utils/calendarMapper";

class CalendarService {

  async getWeek(

    resourceId: string,

    weekStart: Date,

  ) {

    const availability =

      await availabilityService.getWeek(

        resourceId,

        weekStart,

      );

    return mapAvailabilityToCalendar(

      availability,

    );

  }

}

export const calendarService =
new CalendarService();