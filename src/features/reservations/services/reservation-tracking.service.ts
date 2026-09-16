import { supabase } from "@/lib/supabase";

import type {
  AttendanceStatus,
  BalancePaymentMethod,
} from "../types/reservation.types";

import type {
  ReservationPaymentSummary,
  ReservationTracking,
  ReservationTrackingFilters,
} from "../types/reservation-tracking.types";

class ReservationTrackingService {
  async getReservations(
    filters: ReservationTrackingFilters,
  ): Promise<ReservationTracking[]> {
    let query = supabase
      .from("reservations")
      .select(`
        id,
        club_id,
        resource_id,
        customer_name,
        customer_phone,
        customer_email,
        starts_at,
        ends_at,
        amount_paid,
        total_amount,
        deposit_amount,
        status,
        source,
        payment_id,
        payment_status,
        notes,
        reminder_sent_at,
        gym_monthly_fee_id,
        created_at,
        updated_at,
        attendance_status,
        no_show_reason,
        no_show_message_sent_at,
        balance_paid_amount,
        balance_payment_method,
        balance_payment_proof_url,
        resource:resources (
          name,
          type
        )
      `)
      .eq("club_id", filters.clubId)
      .gte("starts_at", `${filters.date}T00:00:00`)
      .lt("starts_at", `${filters.date}T23:59:59.999`)
      .order("starts_at", {
        ascending: true,
      });

    if (filters.attendance === "pending") {
      query = query.is("attendance_status", null);
    }

    if (filters.attendance === "attended") {
      query = query.eq("attendance_status", "attended");
    }

    if (filters.attendance === "no_show") {
      query = query.eq("attendance_status", "no_show");
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as ReservationTracking[];
  }

  async updateAttendance(
    reservationId: string,
    attendanceStatus: AttendanceStatus,
    noShowReason: string | null = null,
  ) {
    const { data, error } = await supabase
      .from("reservations")
      .update({
        attendance_status: attendanceStatus,
        no_show_reason:
          attendanceStatus === "no_show"
            ? noShowReason
            : null,
      })
      .eq("id", reservationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateBalancePayment(
    reservationId: string,
    balancePaidAmount: number,
    paymentMethod: BalancePaymentMethod | null,
  ) {
    const { data, error } = await supabase
      .from("reservations")
      .update({
        balance_paid_amount: balancePaidAmount,
        balance_payment_method: paymentMethod,
      })
      .eq("id", reservationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async uploadProof(
    clubId: string,
    reservationId: string,
    file: File,
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path =
      `${clubId}/${reservationId}/comprobante.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("reservation-proofs")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("reservation-proofs")
        .createSignedUrl(path, 60 * 60);

    if (signedUrlError) {
      throw signedUrlError;
    }

    const { error: updateError } = await supabase
      .from("reservations")
      .update({
        balance_payment_proof_url: path,
      })
      .eq("id", reservationId);

    if (updateError) {
      throw updateError;
    }

    return {
      path,
      signedUrl: signedUrlData.signedUrl,
    };
  }

  async getProofUrl(path: string) {
    const { data, error } = await supabase.storage
      .from("reservation-proofs")
      .createSignedUrl(path, 60 * 60);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  }

  async deleteProof(
    reservationId: string,
    path: string,
  ) {
    const { error: storageError } = await supabase.storage
      .from("reservation-proofs")
      .remove([path]);

    if (storageError) {
      throw storageError;
    }

    const { error } = await supabase
      .from("reservations")
      .update({
        balance_payment_proof_url: null,
      })
      .eq("id", reservationId);

    if (error) {
      throw error;
    }
  }

  calculateSummary(
    reservations: ReservationTracking[],
  ): ReservationPaymentSummary {
    let reservationPayments = 0;
    let totalPayments = 0;

    let cash = 0;
    let mercadoPago = 0;
    let transfer = 0;

    let pendingCollection = 0;

    let attended = 0;
    let noShow = 0;
    let pendingAttendance = 0;

    for (const reservation of reservations) {
      const amountPaid = Number(
        reservation.amount_paid ?? 0,
      );

      const balancePaid = Number(
        reservation.balance_paid_amount ?? 0,
      );

      const totalAmount = Number(
        reservation.total_amount ?? 0,
      );

      reservationPayments += amountPaid;

      totalPayments +=
        amountPaid + balancePaid;

      if (reservation.attendance_status === "attended") {
        attended++;
      } else if (
        reservation.attendance_status === "no_show"
      ) {
        noShow++;
      } else {
        pendingAttendance++;
      }

      if (
        reservation.balance_payment_method === "cash"
      ) {
        cash += balancePaid;
      }

      if (
        reservation.balance_payment_method ===
        "mercado_pago"
      ) {
        mercadoPago += balancePaid;
      }

      if (
        reservation.balance_payment_method ===
        "transfer"
      ) {
        transfer += balancePaid;
      }

      if (
        reservation.attendance_status !== "no_show"
      ) {
        pendingCollection += Math.max(
          0,
          totalAmount -
            amountPaid -
            balancePaid,
        );
      }
    }

    return {
      reservations: reservations.length,
      attended,
      noShow,
      pendingAttendance,
      reservationPayments,
      totalPayments,
      cash,
      mercadoPago,
      transfer,
      pendingCollection,
    };
  }
}

export const reservationTrackingService =
  new ReservationTrackingService();