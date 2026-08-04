import { supabase } from "@/lib/supabase";

import type {
  WorkingHourForm,
  WorkingHour,
} from "../types/working-hours.types";

class WorkingHoursService {
  async save(
    resourceId: string,
    hours: WorkingHourForm[]
  ) {
    await supabase
      .from("working_hours")
      .delete()
      .eq("resource_id", resourceId);

    const { error } = await supabase
      .from("working_hours")
      .insert(
        hours.map((hour) => ({
          resource_id: resourceId,

          ...hour,
        }))
      );

    if (error) throw error;
  }

  async list(resourceId: string) {
    const { data, error } =
      await supabase
        .from("working_hours")
        .select("*")
        .eq("resource_id", resourceId)
        .order("day_of_week");

    if (error) throw error;

    return data as WorkingHour[];
  }
}

export const workingHoursService =
  new WorkingHoursService();