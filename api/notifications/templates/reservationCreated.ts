interface ReservationCreatedTemplateData {
  customerName: string;
  clubName: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  depositAmount: number;
  paymentUrl?: string;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-AR")}`;
}

export function reservationCreatedTemplate(
  data: ReservationCreatedTemplateData,
) {
  const paymentButton = data.paymentUrl
    ? `
      <div style="
        margin-top: 28px;
        text-align: center;
      ">
        <a
          href="${data.paymentUrl}"
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
          Pagar seña
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

  <title>Reserva recibida</title>
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
                Reserva recibida
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
                Recibimos tu solicitud de reserva en
                <strong>${data.clubName}</strong>.
              </p>

              <!-- RESERVATION CARD -->

              <div style="
                background-color: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
              ">

                <p style="
                  margin: 0 0 12px;
                ">
                  <strong>Recurso:</strong>
                  ${data.resourceName}
                </p>

                <p style="
                  margin: 0 0 12px;
                ">
                  <strong>Fecha:</strong>
                  ${data.date}
                </p>

                <p style="
                  margin: 0 0 12px;
                ">
                  <strong>Horario:</strong>
                  ${data.startTime} — ${data.endTime}
                </p>

                <p style="
                  margin: 0 0 12px;
                ">
                  <strong>Precio total:</strong>
                  ${formatCurrency(data.amount)}
                </p>

                <p style="
                  margin: 0;
                ">
                  <strong>Seña:</strong>
                  ${formatCurrency(data.depositAmount)}
                </p>

              </div>

              <p style="
                margin: 24px 0 0;
                font-size: 15px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Tu reserva quedará pendiente hasta completar
                el pago de la seña.
              </p>

              ${paymentButton}

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

              <p style="
                margin: 0;
              ">
                Este email fue enviado por Maneja Tu Cancha.
              </p>

              <p style="
                margin: 8px 0 0;
              ">
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

  return {
    subject: `Reserva recibida - ${data.clubName}`,
    html,
  };
}