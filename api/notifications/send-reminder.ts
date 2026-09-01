import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

import { reservationReminderTemplate } from "../../src/features/notifications/templates/reservationReminder.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

const RESEND_FROM =
  "Maneja Tu Cancha <notificaciones@manejatucancha.com.ar>";

async function sendReminder(reservationId: string) {
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
        payment_status,
        reminder_sent_at
      `)
      .eq("id", reservationId)
      .maybeSingle();

  if (reservationError) {
    throw new Error(
      `Error buscando reserva: ${reservationError.message}`
    );
  }

  if (!reservation) {
    throw new Error("Reserva no encontrada.");
  }

  // Solo reservas confirmadas y pagadas
  if (
    reservation.status !== "confirmed" ||
    reservation.payment_status !== "approved"
  ) {
    throw new Error(
      `La reserva no está confirmada y pagada. status=${reservation.status}, payment_status=${reservation.payment_status}`
    );
  }

  if (!reservation.customer_email) {
    throw new Error("La reserva no tiene email del cliente.");
  }

  // Evitar duplicados
  if (reservation.reminder_sent_at) {
    return {
      skipped: true,
      reason: "already_sent",
      reservation_id: reservation.id,
      email: reservation.customer_email,
    };
  }

  // Buscar club
  const { data: club, error: clubError } = await supabaseAdmin
    .from("clubs")
    .select("name")
    .eq("id", reservation.club_id)
    .maybeSingle();

  if (clubError) {
    throw new Error(
      `Error buscando club: ${clubError.message}`
    );
  }

  if (!club) {
    throw new Error("Club no encontrado.");
  }

  // Buscar recurso
  const { data: resource, error: resourceError } =
    await supabaseAdmin
      .from("resources")
      .select("name")
      .eq("id", reservation.resource_id)
      .maybeSingle();

  if (resourceError) {
    throw new Error(
      `Error buscando recurso: ${resourceError.message}`
    );
  }

  if (!resource) {
    throw new Error("Recurso no encontrado.");
  }

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

  const email = reservationReminderTemplate({
    customerName: reservation.customer_name,
    clubName: club.name,
    resourceName: resource.name,
    date,
    startTime,
    endTime,
  });

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Resend no está configurado correctamente."
    );
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
        from: RESEND_FROM,
        to: [reservation.customer_email],
        subject: email.subject,
        html: email.html,
      }),
    }
  );

  const resendData = await resendResponse.json();

  if (!resendResponse.ok) {
    throw new Error(
      `Resend rechazó el email: ${JSON.stringify(resendData)}`
    );
  }

  // Marcar como enviado SOLO después de que Resend respondió correctamente
  const { error: updateError } = await supabaseAdmin
    .from("reservations")
    .update({
      reminder_sent_at: new Date().toISOString(),
    })
    .eq("id", reservation.id)
    .is("reminder_sent_at", null);

  if (updateError) {
    throw new Error(
      `El email fue enviado, pero no se pudo marcar reminder_sent_at: ${updateError.message}`
    );
  }

  return {
    skipped: false,
    success: true,
    id: resendData.id,
    reservation_id: reservation.id,
    email: reservation.customer_email,
  };
}

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
    

// ------------------------------------------
// MODO MANUAL
// ------------------------------------------
if (reservation_id) {
  const result = await sendReminder(reservation_id);

  return res.status(200).json(result);
}

// ------------------------------------------
// MODO AUTOMÁTICO
// ------------------------------------------

const cronSecret = process.env.CRON_SECRET;

if (!cronSecret) {
  return res.status(500).json({
    error: "CRON_SECRET no está configurado.",
  });
}

const authorization = req.headers.authorization;

if (authorization !== `Bearer ${cronSecret}`) {
  return res.status(401).json({
    error: "No autorizado.",
  });
}

    // ------------------------------------------
    // MODO AUTOMÁTICO
    // ------------------------------------------

    const now = new Date();

    // Buscamos reservas desde aproximadamente
    // 23 horas hasta 25 horas desde ahora.
    //
    // Esto permite que el proceso automático
    // encuentre reservas cercanas a las 24 horas.
    const from = new Date(
      now.getTime() + 23 * 60 * 60 * 1000
    );

    const to = new Date(
      now.getTime() + 25 * 60 * 60 * 1000
    );

    const { data: reservations, error } = await supabaseAdmin
      .from("reservations")
      .select("id")
      .eq("status", "confirmed")
      .eq("payment_status", "approved")
      .not("customer_email", "is", null)
      .is("reminder_sent_at", null)
      .gte("starts_at", from.toISOString())
      .lte("starts_at", to.toISOString())
      .order("starts_at", {
        ascending: true,
      });

    if (error) {
      return res.status(500).json({
        error: "No se pudieron buscar reservas para recordatorio.",
        details: error.message,
      });
    }

    const results = [];

    for (const reservation of reservations ?? []) {
      try {
        const result = await sendReminder(reservation.id);

        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          reservation_id: reservation.id,
          error:
            error instanceof Error
              ? error.message
              : "Error desconocido",
        });
      }
    }

    return res.status(200).json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Error en send-reminder:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error interno enviando recordatorios.",
    });
  }
}