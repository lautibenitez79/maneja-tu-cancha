import type {
  WorkingHour,
} from "@/features/resources/types/working-hours.types";

export function isSlotOpen(

  workingHour: WorkingHour,

  slotStart: string,

  slotEnd: string,

) {

  if (!workingHour.enabled) {

    return false;

  }

  const insidePrimary =

    slotStart >= workingHour.opens_at &&
    slotEnd <= workingHour.closes_at;

  if (insidePrimary) {

    return true;

  }

  if (

    workingHour.reopens_at &&
    workingHour.final_closes_at

  ) {

    return (

      slotStart >= workingHour.reopens_at &&
      slotEnd <= workingHour.final_closes_at

    );

  }

  return false;

}