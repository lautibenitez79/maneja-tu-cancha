import { supabase } from "@/lib/supabase";

import type { Club } from "@/features/clubs/types/club.types";
import type { Resource } from "@/features/resources/types/resource.types";
import type { Reservation } from "@/features/reservations/types/reservation.types";

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
  resourceId,
  customerName,
  customerPhone,
  customerEmail,
  startsAt,
  endsAt,
}: {
  resourceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startsAt: string;
  endsAt: string;
}): Promise<Reservation> {
  const { data, error } =
    await supabase.rpc(
      "create_public_reservation",
      {
        p_resource_id: resourceId,
        p_customer_name: customerName,
        p_customer_phone: customerPhone,
        p_customer_email: customerEmail,
        p_starts_at: startsAt,
        p_ends_at: endsAt,
      },
    );

  if (error) {
    throw error;
  }

  return data as Reservation;
}
async cancelReservation(
  reservationId: string,
): Promise<Reservation> {
  const { data, error } = await supabase.rpc(
    "cancel_public_reservation",
    {
      p_reservation_id: reservationId,
    },
  );

  if (error) {
    throw error;
  }

  return data as Reservation;
}
}

export const publicBookingService = new PublicBookingService();
