import { supabase } from "../../../lib/supabase";

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

  async createClub(ownerId: string, form: CreateClubForm): Promise<Club> {
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

  async createFirstClub(form: CreateClubForm): Promise<Club> {
    const slug = this.generateSlug(form.name);

    const { data: clubId, error } = await supabase.rpc("create_first_club", {
      p_name: form.name,
      p_slug: slug,
      p_phone: form.phone,
      p_email: form.email,
      p_address: form.address,
      p_city: form.city,
      p_province: form.province,
      p_country: form.country,
      p_timezone: form.timezone,
      p_currency: form.currency,
    });

    if (error) throw error;

    const club = await this.getClub(clubId);

    if (!club) {
      throw new Error("El complejo fue creado pero no pudo recuperarse.");
    }

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

  async getClubBySlug(slug: string): Promise<Club | null> {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error) throw error;

    return data;
  }
}

export const clubService = new ClubService();
