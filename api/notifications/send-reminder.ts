

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

import {
  reservationReminderTemplate,
} from "../../src/features/notifications/templates/reservationReminder.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { reservation_id } = req.body ?? {};

    if (!reservation_id) {
      return res.status(400).json({
        error: "reservation_id es obligatorio.",
      });
    }

    // Buscar reserva
    const { data: reservation, error: reservationError } =
      await supabaseAdmin
        .from("reservations")
        .select(`
          id,
          club_id,
          resource_id,
          customer_name,
          customer_email,
          starts_at,
          ends_at,
          status,
          payment_status
        `)
        .eq("id", reservation_id)
        .maybeSingle();

    if (reservationError) {
      console.error("Error buscando reserva:", reservationError);

      return res.status(500).json({
        error: "No se pudo consultar la reserva.",
        details: reservationError.message,
      });
    }

    if (!reservation) {
      return res.status(404).json({
        error: "Reserva no encontrada.",
      });
    }

    // El recordatorio solamente corresponde a reservas confirmadas y pagadas
    if (
      reservation.status !== "confirmed" ||
      reservation.payment_status !== "approved"
    ) {
      return res.status(400).json({
        error: "La reserva no está confirmada y pagada.",
        status: reservation.status,
        payment_status: reservation.payment_status,
      });
    }

    if (!reservation.customer_email) {
      return res.status(400).json({
        error: "La reserva no tiene email del cliente.",
      });
    }

    // Buscar club
    const { data: club, error: clubError } = await supabaseAdmin
      .from("clubs")
      .select("name")
      .eq("id", reservation.club_id)
      .maybeSingle();

    if (clubError) {
      console.error("Error buscando club:", clubError);

      return res.status(500).json({
        error: "No se pudo consultar el club.",
        details: clubError.message,
      });
    }

    if (!club) {
      return res.status(404).json({
        error: "Club no encontrado.",
      });
    }

    // Buscar recurso/cancha
    const { data: resource, error: resourceError } =
      await supabaseAdmin
        .from("resources")
        .select("name")
        .eq("id", reservation.resource_id)
        .maybeSingle();

    if (resourceError) {
      console.error("Error buscando recurso:", resourceError);

      return res.status(500).json({
        error: "No se pudo consultar el recurso.",
        details: resourceError.message,
      });
    }

    if (!resource) {
      return res.status(404).json({
        error: "Recurso no encontrado.",
      });
    }

    // Formatear fecha y hora
    const startDate = new Date(reservation.starts_at);
    const endDate = new Date(reservation.ends_at);

    const date = startDate.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const startTime = startDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const endTime = endDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    });

    // Generar template
    const email = reservationReminderTemplate({
      customerName: reservation.customer_name,
      clubName: club.name,
      resourceName: resource.name,
      date,
      startTime,
      endTime,
    });

    // Enviar mediante Resend
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Resend no está configurado correctamente.",
      });
    }

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Maneja Tu Cancha <notificaciones@manejatucancha.com.ar>",
          to: [reservation.customer_email],
          subject: email.subject,
          html: email.html,
        }),
      }
    );

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Error Resend:", resendData);

      return res.status(resendResponse.status).json({
        error: "No se pudo enviar el recordatorio.",
        details: resendData,
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      reservation_id: reservation.id,
      email: reservation.customer_email,
    });
  } catch (error) {
    console.error("Error enviando recordatorio:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error interno enviando recordatorio.",
    });
  }
}