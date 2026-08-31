import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  reservationCreatedTemplate,
} from "./templates/reservationCreated";

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
      subject,
      html,
      template,
      data,
    } = req.body ?? {};

    let finalSubject = subject;
    let finalHtml = html;

    /*
     * ---------------------------------------------------------
     * TEMPLATES
     * ---------------------------------------------------------
     */

    if (template === "reservationCreated") {
      if (!data) {
        return res.status(400).json({
          error:
            "Faltan los datos del template reservationCreated.",
        });
      }

      const rendered =
        reservationCreatedTemplate(data);

      finalSubject =
        rendered.subject;

      finalHtml =
        rendered.html;
    }

    /*
     * ---------------------------------------------------------
     * VALIDACIÓN
     * ---------------------------------------------------------
     */

    if (!to || !finalSubject || !finalHtml) {
      return res.status(400).json({
        error:
          "to, subject/html o template son obligatorios.",
      });
    }

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

    /*
     * ---------------------------------------------------------
     * RESEND
     * ---------------------------------------------------------
     */

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
            to: [to],
            subject: finalSubject,
            html: finalHtml,
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
        details: responseData,
      });
    }

    console.log(
      "Email enviado correctamente:",
      {
        id: responseData.id,
        to,
        subject: finalSubject,
        template:
          template ?? null,
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
        error instanceof Error
          ? error.message
          : "Error interno enviando email.",
    });
  }
}