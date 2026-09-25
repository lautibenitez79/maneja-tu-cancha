import { supabase } from "../../../lib/supabase";

import type { Club } from "../types/club.types";
import type { CreateClubForm } from "../types/create-club-form.types";

interface UpdateClubData {
  name: string;
  phone: string;
  email: string;
  description: string;
  address: string;
  city: string;
  province: string;
  country: string;
}

export type ClubServiceKey =
  | "wifi"
  | "locker_room"
  | "parking"
  | "medical_aid"
  | "tournaments"
  | "birthdays"
  | "grill"
  | "sports_school"
  | "schools"
  | "bar_restaurant"
  | "quincho"
  | "beelup";

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

    if (form.logo_file) {
      await this.uploadClubAsset(club.id, form.logo_file, "logo");
    }

    const updatedClub = await this.getClub(club.id);

    if (!updatedClub) {
      throw new Error("El complejo fue creado pero no pudo recuperarse.");
    }

    return updatedClub;
  }

  async getClub(id: string): Promise<Club | null> {
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

  async updateClub(clubId: string, values: UpdateClubData): Promise<Club> {
    const { data, error } = await supabase
      .from("clubs")
      .update({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        description: values.description.trim() || null,
        address: values.address.trim(),
        city: values.city.trim(),
        province: values.province.trim(),
        country: values.country.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", clubId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async uploadClubAsset(
    clubId: string,
    file: File,
    type: "logo" | "banner",
  ): Promise<string> {
    const path = `${clubId}/${type}`;

    const { error: uploadError } = await supabase.storage
      .from("club-assets")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("club-assets").getPublicUrl(path);

    const url = data.publicUrl;

    const column = type === "logo" ? "logo_url" : "banner_url";

    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        [column]: url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clubId);

    if (updateError) {
      throw updateError;
    }

    return url;
  }

  async getServices(clubId: string): Promise<ClubServiceKey[]> {
    const { data, error } = await supabase
      .from("club_services")
      .select("service")
      .eq("club_id", clubId)
      .order("service");

    if (error) throw error;

    return (data ?? []).map((item) => item.service as ClubServiceKey);
  }

  async setServices(clubId: string, services: ClubServiceKey[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from("club_services")
      .delete()
      .eq("club_id", clubId);

    if (deleteError) {
      throw deleteError;
    }

    if (services.length === 0) {
      return;
    }

    const rows = services.map((service) => ({
      club_id: clubId,
      service,
    }));

    const { error: insertError } = await supabase
      .from("club_services")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }
}

export const clubService = new ClubService();
