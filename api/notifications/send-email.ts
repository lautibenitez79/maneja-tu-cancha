import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

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
    } = req.body ?? {};

    if (!to || !subject || !html) {
      return res.status(400).json({
        error:
          "to, subject y html son obligatorios.",
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

    const resendResponse = await fetch(
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
          subject,
          html,
        }),
      },
    );

    const data =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend rechazó el email:",
        data,
      );

      return res.status(
        resendResponse.status,
      ).json({
        error:
          "No se pudo enviar el email.",
        details: data,
      });
    }

    console.log(
      "Email enviado correctamente:",
      {
        id: data.id,
        to,
        subject,
      },
    );

    return res.status(200).json({
      success: true,
      id: data.id,
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
          : "Error interno enviando el email.",
    });
  }
}