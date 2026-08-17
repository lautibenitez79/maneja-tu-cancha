import { addDays, format } from "date-fns";

import { formatInTimeZone } from "date-fns-tz";

import { createSlots } from "../utils/createSlots";
import { getSlotStatus } from "../utils/getSlotStatus";
import { getWorkingDayIndex } from "../utils/getWorkingDayIndex";

import type {
  AvailabilityDay,
  AvailabilitySlot,
  AvailabilityWeek,
} from "../types/availability.types";

import type {
  GenerateDayInput,
  GenerateWeekInput,
} from "../types/engine.types";

export class AvailabilityEngine {
  private generateDay(input: GenerateDayInput): AvailabilitySlot[] {
    return createSlots(input.reservationDuration).map((slot) => ({
      starts_at: `${input.date}T${slot.starts_at}:00`,

      ends_at: `${input.date}T${slot.ends_at}:00`,

      ...getSlotStatus(
        slot.starts_at,
        slot.ends_at,
        input.workingHour,
        input.reservations,
        input.resourceBlocks,
        input.timezone,
      ),
    }));
  }

  public generateWeek(input: GenerateWeekInput): AvailabilityWeek {
    const days: AvailabilityDay[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(input.weekStart, i);

      const date = format(currentDate, "yyyy-MM-dd");

      const workingHour = input.workingHours.find(
        (hour) => hour.day_of_week === getWorkingDayIndex(currentDate),
      );

      days.push({
        date,

        slots: workingHour
          ? this.generateDay({
              workingHour,

              reservations: input.reservations.filter(
                (reservation) =>
                  formatInTimeZone(
                    reservation.starts_at,
                    input.timezone,
                    "yyyy-MM-dd",
                  ) === date,
              ),

              resourceBlocks: input.resourceBlocks.filter(
                (block) =>
                  formatInTimeZone(
                    block.starts_at,
                    input.timezone,
                    "yyyy-MM-dd",
                  ) === date,
              ),

              reservationDuration: input.reservationDuration,

              date,

              timezone: input.timezone,
            })
          : [],
      });
    }

    return {
      resourceId: input.resourceId,

      weekStart: format(input.weekStart, "yyyy-MM-dd"),

      days,
    };
  }
}
