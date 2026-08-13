import { supabase } from "@/lib/supabase";

import type { ResourceBlock } from "../types/resource-block.types";

class ResourceBlockService {
  async listByDay(
    resourceId: string,

    date: string,
  ): Promise<ResourceBlock[]> {
    const start = `${date}T00:00:00`;

    const end = `${date}T23:59:59`;

    const { data, error } = await supabase

      .from("resource_blocks")

      .select("*")

      .eq("resource_id", resourceId)

      .gte("starts_at", start)

      .lte("starts_at", end)

      .order("starts_at");

    if (error) {
      throw error;
    }

    return data;
  }

  async listByWeek(
    resourceId: string,

    weekStart: string,

    weekEnd: string,
  ): Promise<ResourceBlock[]> {
    const { data, error } = await supabase

      .from("resource_blocks")

      .select("*")

      .eq("resource_id", resourceId)

      .gte("starts_at", weekStart)

      .lte("starts_at", weekEnd)

      .order("starts_at");

    if (error) {
      throw error;
    }

    return data;
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
}

export const resourceBlockService = new ResourceBlockService();
