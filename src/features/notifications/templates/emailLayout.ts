interface EmailLayoutOptions {
  title: string;
  children: string;
}

export function emailLayout({
  title,
  children,
}: EmailLayoutOptions): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding: 32px 16px;"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width: 600px;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
          "
        >

          <!-- HEADER -->

          <tr>
            <td style="
              padding: 28px 32px;
              border-bottom: 1px solid #e5e7eb;
            ">
              <h1 style="
                margin: 0;
                font-size: 22px;
                color: #2563eb;
              ">
                Maneja Tu Cancha
              </h1>
            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td style="
              padding: 32px;
            ">

              <h2 style="
                margin: 0 0 24px;
                font-size: 24px;
                color: #111827;
              ">
                ${title}
              </h2>

              ${children}

            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td style="
              padding: 24px 32px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            ">
              <p style="margin: 0;">
                Este email fue enviado por Maneja Tu Cancha.
              </p>

              <p style="margin: 8px 0 0;">
                Gestión de reservas para complejos deportivos.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}