import { supabase } from "@/lib/supabase";

import type { Club } from "@/features/clubs/types/club.types";
import type { Resource } from "@/features/resources/types/resource.types";
import type { PublicAvailableSlot } from "../types/public-booking.types";

class PublicBookingService {
  async getClubBySlug(slug: string): Promise<Club | null> {
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async getResources(clubId: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("club_id", clubId)
      .eq("active", true)
      .order("created_at");

    if (error) {
      throw error;
    }

    return data as Resource[];
  }

  async getAvailableSlots(
    resourceId: string,
    date: string,
  ): Promise<PublicAvailableSlot[]> {
    const { data, error } = await supabase.rpc("get_public_available_slots", {
      p_resource_id: resourceId,
      p_date: date,
    });

    if (error) {
      throw error;
    }

    return (data ?? []) as PublicAvailableSlot[];
  }
  async createReservation({
    clubId,
    resourceId,
    customerName,
    customerPhone,
    customerEmail,
    startsAt,
    endsAt,
  }: {
    clubId: string;
    resourceId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    startsAt: string;
    endsAt: string;
  }) {
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        club_id: clubId,
        resource_id: resourceId,

        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,

        starts_at: startsAt,
        ends_at: endsAt,

        amount_paid: 0,
        status: "pending_payment",
        source: "web",

        payment_id: null,
        notes: "",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

export const publicBookingService = new PublicBookingService();
