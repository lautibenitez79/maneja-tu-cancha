import { supabase } from "@/lib/supabase";

import type {
  Reservation,
  CreateReservationForm,
  ReservationStatus,
  UpdateReservationForm,
} from "../types/reservation.types";
import { validateReservation } from "../utils/reservationValidator";
import { canCreateReservation } from "../utils/canCreateReservation";

class ReservationService {
  async listByDay(resourceId: string, date: string): Promise<Reservation[]> {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;

    const { data, error } = await supabase

      .from("reservations")

      .select("*")

      .eq("resource_id", resourceId)

      .gte("starts_at", start)

      .lte("starts_at", end)

      .order("starts_at");

    if (error) throw error;

    return data;
  }

  async listByClubAndDate(
    clubId: string,
    startAt: string,
    endAt: string,
  ): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("club_id", clubId)
      .gte("starts_at", startAt)
      .lt("starts_at", endAt)
      .order("starts_at");

    if (error) throw error;

    return data;
  }

  async create(clubId: string, form: CreateReservationForm) {
    const date = form.starts_at.substring(0, 10);

    const reservations = await this.listByDay(form.resource_id, date);

    canCreateReservation(
      reservations,

      form.starts_at,

      form.ends_at,
    );

    validateReservation(form);

    const { data, error } = await supabase

      .from("reservations")

      .insert({
        club_id: clubId,

        ...form,

        status: form.source === "admin" ? "confirmed" : "pending_payment",
      })

      .select()

      .single();

    if (error) throw error;

    return data;
  }

  async updateStatus(
    id: string,

    status: ReservationStatus,
  ) {
    const { error } = await supabase

      .from("reservations")

      .update({
        status,

        updated_at: new Date().toISOString(),
      })

      .eq("id", id);

    if (error) throw error;
  }

  async remove(id: string) {
    const { error } = await supabase

      .from("reservations")

      .delete()

      .eq("id", id);

    if (error) throw error;
  }

  async getById(id: string): Promise<Reservation> {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  }

  async listByWeek(
    resourceId: string,

    weekStart: string,

    weekEnd: string,
  ): Promise<Reservation[]> {
    const { data, error } = await supabase

      .from("reservations")

      .select("*")

      .eq("resource_id", resourceId)

      .gte("starts_at", weekStart)

      .lte("starts_at", weekEnd)

      .order("starts_at");

    if (error) throw error;

    return data;
  }
  async update(id: string, values: UpdateReservationForm) {
    const current = await this.getById(id);

    const resourceId = current.resource_id;

    const startsAt = values.starts_at ?? current.starts_at;

    const endsAt = values.ends_at ?? current.ends_at;

    const date = startsAt.substring(0, 10);

    const reservations = await this.listByDay(resourceId, date);

    const collision = reservations.find((reservation) => {
      // Ignoramos la propia reserva
      if (reservation.id === id) {
        return false;
      }

      // Una reserva cancelada
      // no bloquea el horario
      if (reservation.status === "cancelled") {
        return false;
      }

      const reservationStart = reservation.starts_at.substring(11, 16);

      const reservationEnd = reservation.ends_at.substring(11, 16);

      const newStart = startsAt.substring(11, 16);

      const newEnd = endsAt.substring(11, 16);

      return newStart < reservationEnd && newEnd > reservationStart;
    });

    if (collision) {
      throw new Error("Ese horario ya se encuentra reservado.");
    }

    const { data, error } = await supabase
      .from("reservations")
      .update({
        ...values,

        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

export const reservationService = new ReservationService();
