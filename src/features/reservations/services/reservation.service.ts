import { supabase } from "@/lib/supabase";
import { fromZonedTime } from "date-fns-tz";
import type {
  Reservation,
  CreateReservationForm,
  ReservationStatus,
  PaymentStatus,
  UpdateReservationForm,
} from "../types/reservation.types";
import { validateReservation } from "../utils/reservationValidator";
import { canCreateReservation } from "../utils/canCreateReservation";

class ReservationService {
  async listByDay(
    resourceId: string,
    date: string,
    timezone = "America/Argentina/Buenos_Aires",
  ): Promise<Reservation[]> {
    const localStart = `${date}T00:00:00`;
    const localEnd = `${date}T23:59:59`;

    const start = fromZonedTime(localStart, timezone).toISOString();

    const end = fromZonedTime(localEnd, timezone).toISOString();

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

        payment_status: form.source === "admin" ? "not_required" : "pending",
      })

      .select()

      .single();

    if (error) throw error;

    return data;
  }

  async createPublic(form: CreateReservationForm) {
    validateReservation(form);

    if (form.source !== "web") {
      throw new Error("Una reserva pública debe tener origen web.");
    }

    const { data, error } = await supabase.rpc("create_public_reservation", {
      p_resource_id: form.resource_id,
      p_customer_name: form.customer_name.trim(),
      p_customer_phone: form.customer_phone.trim(),
      p_customer_email: form.customer_email.trim(),
      p_starts_at: form.starts_at,
      p_ends_at: form.ends_at,
      p_notes: form.notes?.trim() || null,
    });

    if (error) {
      throw error;
    }

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

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paymentId?: string | null,
    amountPaid?: number,
  ) {
    const update: {
      payment_status: PaymentStatus;
      payment_id?: string | null;
      amount_paid?: number;
      status?: ReservationStatus;
      updated_at: string;
    } = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    if (paymentId !== undefined) {
      update.payment_id = paymentId;
    }

    if (amountPaid !== undefined) {
      update.amount_paid = amountPaid;
    }

    if (paymentStatus === "approved") {
      update.status = "confirmed";
    }

    if (paymentStatus === "rejected") {
      update.status = "cancelled";
    }

    const { data, error } = await supabase
      .from("reservations")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Reservation;
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
    timezone = "America/Argentina/Buenos_Aires",
  ): Promise<Reservation[]> {
    const localStart = `${weekStart}T00:00:00`;
    const localEnd = `${weekEnd}T23:59:59`;

    const start = fromZonedTime(localStart, timezone).toISOString();

    const end = fromZonedTime(localEnd, timezone).toISOString();

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
