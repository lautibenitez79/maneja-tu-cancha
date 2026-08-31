interface ReservationCancelledTemplateData {
  customerName: string;
  clubName: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export function reservationCancelledTemplate(
  data: ReservationCancelledTemplateData,
) {
  const reason = data.reason
    ? `
      <div style="
        margin-top: 24px;
        padding: 16px;
        border-radius: 10px;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
      ">
        <strong>Motivo:</strong>
        <p style="
          margin: 8px 0 0;
          line-height: 1.5;
        ">
          ${data.reason}
        </p>
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

  <title>Reserva cancelada</title>
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
                Reserva cancelada
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
                Tu reserva en
                <strong>${data.clubName}</strong>
                fue cancelada.
              </p>

              <div style="
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 12px;
                padding: 20px;
              ">

                <p style="margin: 0 0 12px;">
                  <strong>Recurso:</strong>
                  ${data.resourceName}
                </p>

                <p style="margin: 0 0 12px;">
                  <strong>Fecha:</strong>
                  ${data.date}
                </p>

                <p style="margin: 0;">
                  <strong>Horario:</strong>
                  ${data.startTime} — ${data.endTime}
                </p>

              </div>

              ${reason}

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
    subject: `Reserva cancelada - ${data.clubName}`,
    html,
  };
}