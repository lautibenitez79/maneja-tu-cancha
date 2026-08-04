import { supabase } from "../../../lib/supabase";

import type { Profile } from "../types/profile.types";

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    return data;
  },

  async updateProfile(
    userId: string,
    values: Partial<Profile>
  ) {
    const { error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", userId);

    if (error) throw error;
  },
};