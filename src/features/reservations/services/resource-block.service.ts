import { supabase } from "@/lib/supabase";
import { fromZonedTime } from "date-fns-tz";
import type { ResourceBlock } from "../types/resource-block.types";

class ResourceBlockService {
  async listByDay(
    resourceId: string,
    date: string,
    timezone = "America/Argentina/Buenos_Aires",
  ): Promise<ResourceBlock[]> {
    const localStart = `${date}T00:00:00`;
    const localEnd = `${date}T23:59:59`;

    const start = fromZonedTime(localStart, timezone).toISOString();

    const end = fromZonedTime(localEnd, timezone).toISOString();

    const { data, error } = await supabase
      .from("resource_blocks")
      .select("*")
      .eq("resource_id", resourceId)
      .lt("starts_at", end)
      .gt("ends_at", start)
      .order("starts_at");

    if (error) {
      throw error;
    }

    return data as ResourceBlock[];
  }

  async listByWeek(
    resourceId: string,
    weekStart: string,
    weekEnd: string,
    timezone = "America/Argentina/Buenos_Aires",
  ): Promise<ResourceBlock[]> {
    const localStart = `${weekStart}T00:00:00`;
    const localEnd = `${weekEnd}T23:59:59`;

    const start = fromZonedTime(localStart, timezone).toISOString();

    const end = fromZonedTime(localEnd, timezone).toISOString();

    const { data, error } = await supabase
      .from("resource_blocks")
      .select("*")
      .eq("resource_id", resourceId)
      .lt("starts_at", end)
      .gt("ends_at", start)
      .order("starts_at");

    if (error) {
      throw error;
    }

    return data as ResourceBlock[];
  }

  async create(
    resourceId: string,
    startsAt: string,
    endsAt: string,
    reason: string,
  ) {
    const { data, error } = await supabase
      .from("resource_blocks")
      .insert({
        resource_id: resourceId,
        starts_at: startsAt,
        ends_at: endsAt,
        reason,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ResourceBlock;
  }

  async remove(id: string) {
    const { error } = await supabase
      .from("resource_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  }
}

export const resourceBlockService = new ResourceBlockService();
