interface GymMembershipExpiringTemplateData {
  customerName: string;
  clubName: string;
  expirationDate: string;
  reservationUrl?: string;
}

export function gymMembershipExpiringTemplate(
  data: GymMembershipExpiringTemplateData,
) {
  const reservationButton = data.reservationUrl
    ? `
      <div style="
        margin-top: 28px;
        text-align: center;
      ">
        <a
          href="${data.reservationUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
          "
        >
          Renovar mis turnos
        </a>
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>

<html lang="es">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Finalización del período</title>
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
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
          "
        >

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

          <tr>
            <td style="
              padding: 32px;
            ">

              <h2 style="
                margin: 0 0 24px;
                font-size: 24px;
                color: #111827;
              ">
                Tu período está por finalizar
              </h2>

              <p style="
                margin: 0 0 20px;
                font-size: 16px;
                line-height: 1.6;
              ">
                Hola
                <strong>${data.customerName}</strong>,
              </p>

              <p style="
                margin: 0 0 24px;
                font-size: 16px;
                line-height: 1.6;
              ">
                Tu período de turnos en
                <strong>${data.clubName}</strong>
                finaliza el
                <strong>${data.expirationDate}</strong>.
              </p>

              <div style="
                background-color: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 12px;
                padding: 20px;
              ">

                <p style="
                  margin: 0;
                  line-height: 1.6;
                ">
                  Para continuar asistiendo al gimnasio,
                  deberás seleccionar nuevamente tus días,
                  horarios y realizar el pago correspondiente
                  para el próximo período.
                </p>

              </div>

              ${reservationButton}

            </td>
          </tr>

          <tr>
            <td style="
              padding: 24px 32px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            ">

              Este email fue enviado por Maneja Tu Cancha.

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>

</html>
`;

  return {
    subject: `Tu período está por finalizar - ${data.clubName}`,
    html,
  };
}