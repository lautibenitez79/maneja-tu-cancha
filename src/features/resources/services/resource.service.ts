import { supabase } from "@/lib/supabase";

import type { Resource, CreateResourceForm } from "../types/resource.types";

class ResourceService {
  async list(clubId: string) {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at");

    if (error) throw error;

    return data as Resource[];
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as Resource;
  }

  async create(clubId: string, form: CreateResourceForm) {
    const { data, error } = await supabase
      .from("resources")
      .insert({
        club_id: clubId,
        name: form.name,
        type: form.type,
        capacity: form.capacity,
        reservation_duration: form.reservation_duration,
        price: form.price,
        deposit_amount: form.deposit_amount,
      })
      .select()
      .single();

    if (error) throw error;

    return data as Resource;
  }

  async update(id: string, values: Partial<Resource>) {
    const { error } = await supabase
      .from("resources")
      .update(values)
      .eq("id", id);

    if (error) throw error;
  }

  async remove(id: string) {
    const { error } = await supabase.from("resources").delete().eq("id", id);

    if (error) throw error;
  }
}

export const resourceService = new ResourceService();
