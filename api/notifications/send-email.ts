import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  reservationCreatedTemplate,
} from "../../src/features/notifications/templates/reservationCreated.js";

import {
  reservationCancelledTemplate,
} from "../../src/features/notifications/templates/reservationCancelled.js";

const FROM_EMAIL =
  "Maneja Tu Cancha <notificaciones@manejatucancha.com.ar>";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      to,
      template,
      data,
    } = req.body ?? {};

    /*
     * ---------------------------------------------------------
     * VALIDACIÓN BÁSICA
     * ---------------------------------------------------------
     */

    if (
      typeof to !== "string" ||
      !to.trim()
    ) {
      return res.status(400).json({
        error: "El destinatario es obligatorio.",
      });
    }

    /*
     * ---------------------------------------------------------
     * TEMPLATES PERMITIDOS
     * ---------------------------------------------------------
     */

    if (
      template !== "reservationCreated" &&
      template !== "reservationCancelled"
    ) {
      return res.status(400).json({
        error: "Template de email no permitido.",
      });
    }

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        error: "Faltan los datos del template.",
      });
    }

    let rendered;

    switch (template) {
      case "reservationCreated":
        rendered = reservationCreatedTemplate(data);
        break;

      case "reservationCancelled":
        rendered = reservationCancelledTemplate(data);
        break;

      default:
        return res.status(400).json({
          error: "Template de email no permitido.",
        });
    }

    if (!rendered?.subject || !rendered?.html) {
      return res.status(400).json({
        error: "No se pudo generar el email.",
      });
    }

    /*
     * ---------------------------------------------------------
     * RESEND
     * ---------------------------------------------------------
     */

    const apiKey =
      process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error(
        "Falta RESEND_API_KEY.",
      );

      return res.status(500).json({
        error:
          "Resend no está configurado correctamente.",
      });
    }

    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`,
          },

          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [to.trim()],
            subject: rendered.subject,
            html: rendered.html,
          }),
        },
      );

    const responseData =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend rechazó el email:",
        responseData,
      );

      return res.status(
        resendResponse.status,
      ).json({
        error:
          "No se pudo enviar el email.",
      });
    }

    console.log(
      "Email enviado correctamente:",
      {
        id: responseData.id,
        to: to.trim(),
        template,
      },
    );

    return res.status(200).json({
      success: true,
      id: responseData.id,
    });
  } catch (error) {
    console.error(
      "Error enviando email:",
      error,
    );

    return res.status(500).json({
      error:
        "Error interno enviando email.",
    });
  }
}