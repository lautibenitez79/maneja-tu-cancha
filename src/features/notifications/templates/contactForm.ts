export type ContactFormData = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function contactFormTemplate(
  data: ContactFormData,
) {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const company = escapeHtml(
    data.company?.trim() || "No informado",
  );
  const message = escapeHtml(data.message).replace(
    /\n/g,
    "<br />",
  );

  return {
    subject: `Nuevo contacto — ${name}`,

    html: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Nuevo contacto — Maneja Tu Cancha</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 40px 20px;
            background: #f8fafc;
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
          "
        >
          <div
            style="
              max-width: 620px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              border: 1px solid #e2e8f0;
            "
          >
            <div
              style="
                padding: 28px 32px;
                background: #0f172a;
                color: #ffffff;
              "
            >
              <p
                style="
                  margin: 0 0 8px;
                  font-size: 12px;
                  font-weight: bold;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                  color: #60a5fa;
                "
              >
                Maneja Tu Cancha
              </p>

              <h1
                style="
                  margin: 0;
                  font-size: 28px;
                  line-height: 1.2;
                "
              >
                Nuevo contacto
              </h1>
            </div>

            <div style="padding: 32px;">
              <div
                style="
                  padding: 20px;
                  margin-bottom: 20px;
                  background: #f8fafc;
                  border-radius: 14px;
                "
              >
                <p
                  style="
                    margin: 0 0 6px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #64748b;
                    text-transform: uppercase;
                  "
                >
                  Nombre
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                  "
                >
                  ${name}
                </p>
              </div>

              <div
                style="
                  padding: 20px;
                  margin-bottom: 20px;
                  background: #f8fafc;
                  border-radius: 14px;
                "
              >
                <p
                  style="
                    margin: 0 0 6px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #64748b;
                    text-transform: uppercase;
                  "
                >
                  Email
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 16px;
                  "
                >
                  <a
                    href="mailto:${email}"
                    style="
                      color: #2563eb;
                      text-decoration: none;
                    "
                  >
                    ${email}
                  </a>
                </p>
              </div>

              <div
                style="
                  padding: 20px;
                  margin-bottom: 20px;
                  background: #f8fafc;
                  border-radius: 14px;
                "
              >
                <p
                  style="
                    margin: 0 0 6px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #64748b;
                    text-transform: uppercase;
                  "
                >
                  Empresa / Club
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 16px;
                  "
                >
                  ${company}
                </p>
              </div>

              <div
                style="
                  padding: 20px;
                  background: #f8fafc;
                  border-radius: 14px;
                "
              >
                <p
                  style="
                    margin: 0 0 10px;
                    font-size: 12px;
                    font-weight: bold;
                    color: #64748b;
                    text-transform: uppercase;
                  "
                >
                  Mensaje
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 16px;
                    line-height: 1.7;
                    color: #334155;
                  "
                >
                  ${message}
                </p>
              </div>

              <div
                style="
                  margin-top: 28px;
                  padding-top: 20px;
                  border-top: 1px solid #e2e8f0;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #94a3b8;
                  "
                >
                  Este mensaje fue enviado desde el formulario de
                  contacto de Maneja Tu Cancha.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}