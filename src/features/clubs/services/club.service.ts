import { supabase } from "../../../lib/supabase";
import { profileService } from "../../profiles/services/profile.service";

import type { Club } from "../types/club.types";
import type { CreateClubForm } from "../types/create-club-form.types";

class ClubService {
  private generateSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async getClubByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  async createClub(
    ownerId: string,
    form: CreateClubForm
  ): Promise<Club> {
    const existing = await this.getClubByOwner(ownerId);

    if (existing) {
      throw new Error("El usuario ya posee un club.");
    }

    const slug = this.generateSlug(form.name);

    const { data, error } = await supabase
      .from("clubs")
      .insert({
        owner_id: ownerId,

        name: form.name,

        slug,

        phone: form.phone,

        email: form.email,

        address: form.address,

        city: form.city,

        province: form.province,

        country: form.country,

        timezone: form.timezone,

        currency: form.currency,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async createFirstClub(
    ownerId: string,
    form: CreateClubForm
  ) {
    const club = await this.createClub(
      ownerId,
      form
    );

    await profileService.updateProfile(ownerId, {
      club_id: club.id,
    });

    return club;
  }

  async getClub(id: string) {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return data;
  }
}

export const clubService = new ClubService();