import type { VercelRequest, VercelResponse } from "@vercel/node";
import { formatInTimeZone } from "date-fns-tz";
import { reservationConfirmedTemplate } from "../../src/features/notifications/templates/reservationConfirmed.js";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  /*
   * Mercado Pago espera una respuesta rápida.
   *
   * Aceptamos POST y respondemos 200 incluso
   * cuando una notificación no corresponde a payment.
   */

  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
    });
  }

  try {
    console.log("=== MERCADO PAGO WEBHOOK ===");

    console.log("Body:", JSON.stringify(req.body));
    console.log("Query:", JSON.stringify(req.query));

    /*
     * ---------------------------------------------------------
     * 1. Obtener payment_id
     * ---------------------------------------------------------
     */

    let paymentId: string | null = null;

    if (req.body?.type === "payment" && req.body?.data?.id) {
      paymentId = String(req.body.data.id);
    }

    if (!paymentId && req.query.topic === "payment" && req.query.id) {
      paymentId = String(req.query.id);
    }

    if (!paymentId && req.query.type === "payment" && req.query.id) {
      paymentId = String(req.query.id);
    }

    if (!paymentId) {
      console.log("Webhook sin payment_id.");

      return res.status(200).json({
        ok: true,
        ignored: true,
      });
    }

    console.log("Payment ID recibido:", paymentId);

    /*
     * ---------------------------------------------------------
     * 2. Buscar cuentas Mercado Pago activas
     * ---------------------------------------------------------
     */

    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("club_marketplace_accounts")
      .select(
        `
        club_id,
        mp_user_id,
        access_token,
        refresh_token,
        token_type,
        scope,
        expires_at,
        active
        `,
      )
      .eq("provider", "mercadopago")
      .eq("active", true);

    if (accountsError) {
      console.error(
        "Error buscando cuentas Mercado Pago:",
        accountsError,
      );

      return res.status(200).json({
        ok: false,
        payment_found: false,
        error: "Error buscando cuentas Mercado Pago",
      });
    }

    if (!accounts?.length) {
      console.error("No hay cuentas Mercado Pago conectadas.");

      return res.status(200).json({
        ok: false,
        payment_found: false,
        error: "No hay cuentas Mercado Pago conectadas",
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. Encontrar el pago
     * ---------------------------------------------------------
     */

    let payment: any = null;
    let sellerAccount: any = null;

    for (const account of accounts) {
      if (!account.access_token) {
        continue;
      }

      try {
        const accessToken = account.access_token;

        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
            paymentId,
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!mpResponse.ok) {
          continue;
        }

        const mpData = await mpResponse.json();

        if (!mpData?.id) {
          continue;
        }

        payment = mpData;
        sellerAccount = account;

        break;
      } catch (error) {
        console.error("Error consultando pago:", {
          club_id: account.club_id,
          mp_user_id: account.mp_user_id,
          error,
        });
      }
    }

    /*
     * ---------------------------------------------------------
     * 4. Pago no encontrado
     * ---------------------------------------------------------
     */

    if (!payment) {
      console.error("No se pudo encontrar el pago:", paymentId);

      return res.status(200).json({
        ok: true,
        payment_found: false,
        payment_id: paymentId,
      });
    }

    console.log("Pago encontrado:", {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      transaction_amount: payment.transaction_amount,
      external_reference: payment.external_reference,
      collector_id: payment.collector_id,
    });

    /*
     * ---------------------------------------------------------
     * 5. Validar vendedor
     * ---------------------------------------------------------
     */

    if (!sellerAccount) {
      console.error("No se pudo determinar el vendedor.");

      return res.status(200).json({
        ok: false,
        payment_found: true,
        error: "No se pudo determinar el vendedor",
      });
    }

    if (
      payment.collector_id &&
      String(payment.collector_id) !== String(sellerAccount.mp_user_id)
    ) {
      console.error("INCONSISTENCIA DE VENDEDOR:", {
        payment_collector_id: payment.collector_id,
        account_mp_user_id: sellerAccount.mp_user_id,
        club_id: sellerAccount.club_id,
      });

      return res.status(200).json({
        ok: false,
        payment_found: true,
        error: "El vendedor del pago no coincide con la cuenta conectada",
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. Obtener external_reference
     * ---------------------------------------------------------
     */

    const externalReference = payment.external_reference;

    if (!externalReference) {
      console.error("El pago no tiene external_reference.");

      return res.status(200).json({
        ok: true,
        payment_found: true,
        reason: "Pago sin external_reference",
      });
    }

    /*
     * ---------------------------------------------------------
     * 7. Determinar tipo de operación
     * ---------------------------------------------------------
     *
     * Reserva normal:
     *   external_reference = reservation UUID
     *
     * Cuota gimnasio:
     *   external_reference = gym_fee:<fee UUID>
     */

    const isGymFee = externalReference.startsWith("gym_fee:");

    if (isGymFee) {
      /*
       * =========================================================
       * FLUJO CUOTA MENSUAL DE GIMNASIO
       * =========================================================
       */

      const feeId = externalReference.replace(/^gym_fee:/, "");

      if (!feeId) {
        console.error("gym_fee sin ID:", externalReference);

        return res.status(200).json({
          ok: false,
          payment_found: true,
          error: "external_reference de cuota inválido",
        });
      }

      /*
       * ---------------------------------------------------------
       * 7.1 Buscar cuota
       * ---------------------------------------------------------
       */

      const { data: fee, error: feeError } = await supabaseAdmin
        .from("gym_monthly_fees")
        .select(
          `
          id,
          club_id,
          customer_name,
          customer_email,
          total_visits,
          total_amount,
          payment_status,
          payment_id,
          status
          `,
        )
        .eq("id", feeId)
        .maybeSingle();

      if (feeError) {
        console.error("Error buscando cuota gimnasio:", feeError);

        return res.status(200).json({
          ok: false,
          payment_found: true,
          fee_found: false,
          error: "Error buscando cuota gimnasio",
        });
      }

      if (!fee) {
        console.error("Cuota gimnasio no encontrada:", feeId);

        return res.status(200).json({
          ok: true,
          payment_found: true,
          fee_found: false,
          external_reference: externalReference,
        });
      }

      /*
       * ---------------------------------------------------------
       * 7.2 Validar club
       * ---------------------------------------------------------
       */

      if (fee.club_id !== sellerAccount.club_id) {
        console.error("INCONSISTENCIA DE CLUB EN CUOTA:", {
          fee_club_id: fee.club_id,
          seller_club_id: sellerAccount.club_id,
          payment_id: payment.id,
          fee_id: fee.id,
        });

        return res.status(200).json({
          ok: false,
          payment_found: true,
          fee_found: true,
          error: "La cuota no pertenece al club de la cuenta Mercado Pago",
        });
      }

      /*
       * ---------------------------------------------------------
       * 7.3 Validar importe
       * ---------------------------------------------------------
       */

      const expectedAmount = Number(fee.total_amount);
      const paidAmount = Number(payment.transaction_amount);

      if (!Number.isFinite(expectedAmount) || !Number.isFinite(paidAmount)) {
        console.error("Importe inválido para cuota:", {
          expectedAmount,
          paidAmount,
        });

        return res.status(200).json({
          ok: false,
          payment_found: true,
          fee_found: true,
          error: "Importe inválido",
        });
      }

      if (expectedAmount !== paidAmount) {
        console.error("INCONSISTENCIA DE IMPORTE EN CUOTA:", {
          expected_amount: expectedAmount,
          paid_amount: paidAmount,
          fee_id: fee.id,
          payment_id: payment.id,
        });

        return res.status(200).json({
          ok: false,
          payment_found: true,
          fee_found: true,
          error: "El importe del pago no coincide con la cuota",
        });
      }

      /*
       * ---------------------------------------------------------
       * 7.4 Idempotencia
       * ---------------------------------------------------------
       */

      if (
        fee.payment_id &&
        String(fee.payment_id) === String(payment.id) &&
        fee.status === "active"
      ) {
        console.log("Pago de cuota ya procesado:", payment.id);

        return res.status(200).json({
          ok: true,
          payment_found: true,
          fee_found: true,
          already_processed: true,
          payment: {
            id: payment.id,
            status: payment.status,
            transaction_amount: payment.transaction_amount,
            external_reference: payment.external_reference,
          },
          fee: {
            id: fee.id,
            club_id: fee.club_id,
            payment_id: fee.payment_id,
            payment_status: fee.payment_status,
            status: fee.status,
          },
        });
      }

      /*
       * ---------------------------------------------------------
       * 7.5 Procesar estado
       * ---------------------------------------------------------
       */

      if (payment.status === "approved") {
        /*
         * Primero guardamos el payment_id en la cuota.
         *
         * La activación posterior crea las reservas
         * correspondientes a todas las ocurrencias.
         */

        const { error: feePaymentUpdateError } = await supabaseAdmin
          .from("gym_monthly_fees")
          .update({
            payment_id: String(payment.id),
            payment_status: "approved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", fee.id)
          .eq("club_id", sellerAccount.club_id);

        if (feePaymentUpdateError) {
          console.error(
            "Error guardando pago de cuota:",
            feePaymentUpdateError,
          );

          return res.status(200).json({
            ok: false,
            payment_found: true,
            fee_found: true,
            error: "Error actualizando cuota",
          });
        }

        /*
         * -------------------------------------------------------
         * Activar cuota
         * -------------------------------------------------------
         *
         * La RPC:
         *
         * - crea las reservas confirmadas
         * - vincula cada ocurrencia
         * - distribuye el importe total
         * - marca la cuota como active
         */

        const { error: activationError } = await supabaseAdmin.rpc(
          "activate_gym_monthly_fee",
          {
            p_fee_id: fee.id,
            p_payment_id: String(payment.id),
          },
        );

        if (activationError) {
          console.error(
            "Error activando cuota mensual:",
            activationError,
          );

          /*
           * Dejamos payment_id registrado para trazabilidad,
           * pero la RPC debe ejecutarse nuevamente de forma
           * idempotente si Mercado Pago reenvía el webhook.
           */

          return res.status(200).json({
            ok: false,
            payment_found: true,
            fee_found: true,
            error: "Error activando cuota mensual",
            details: activationError,
          });
        }

        console.log("Cuota mensual activada correctamente:", {
          fee_id: fee.id,
          payment_id: payment.id,
        });

        return res.status(200).json({
          ok: true,
          payment_found: true,
          fee_found: true,
          gym_monthly_fee: {
            id: fee.id,
            payment_id: payment.id,
            payment_status: "approved",
            status: "active",
          },
        });
      }

      /*
       * ---------------------------------------------------------
       * Pago rechazado
       * ---------------------------------------------------------
       */

      if (payment.status === "rejected") {
        const { data: updatedFee, error: updateError } =
          await supabaseAdmin
            .from("gym_monthly_fees")
            .update({
              payment_id: String(payment.id),
              payment_status: "rejected",
              status: "pending_payment",
              updated_at: new Date().toISOString(),
            })
            .eq("id", fee.id)
            .eq("club_id", sellerAccount.club_id)
            .select(
              `
              id,
              club_id,
              payment_status,
              payment_id,
              status
              `,
            )
            .single();

        if (updateError) {
          console.error(
            "Error actualizando cuota rechazada:",
            updateError,
          );

          return res.status(200).json({
            ok: false,
            payment_found: true,
            fee_found: true,
            error: "Error actualizando cuota",
          });
        }

        return res.status(200).json({
          ok: true,
          payment_found: true,
          fee_found: true,
          fee: updatedFee,
        });
      }

      /*
       * ---------------------------------------------------------
       * Pago pendiente / en proceso
       * ---------------------------------------------------------
       */

      if (
        payment.status === "pending" ||
        payment.status === "in_process"
      ) {
        const { data: updatedFee, error: updateError } =
          await supabaseAdmin
            .from("gym_monthly_fees")
            .update({
              payment_status: "pending",
              updated_at: new Date().toISOString(),
            })
            .eq("id", fee.id)
            .eq("club_id", sellerAccount.club_id)
            .select(
              `
              id,
              club_id,
              payment_status,
              payment_id,
              status
              `,
            )
            .single();

        if (updateError) {
          console.error(
            "Error actualizando cuota pendiente:",
            updateError,
          );

          return res.status(200).json({
            ok: false,
            payment_found: true,
            fee_found: true,
            error: "Error actualizando cuota",
          });
        }

        return res.status(200).json({
          ok: true,
          payment_found: true,
          fee_found: true,
          fee: updatedFee,
        });
      }

      console.log(
        "Estado de Mercado Pago no procesado para cuota:",
        payment.status,
      );

      return res.status(200).json({
        ok: true,
        payment_found: true,
        fee_found: true,
        ignored_status: payment.status,
      });
    }

    /*
     * =========================================================
     * FLUJO RESERVA NORMAL
     * =========================================================
     *
     * Desde acá conservamos el comportamiento existente.
     */

    /*
     * ---------------------------------------------------------
     * 8. Buscar reserva
     * ---------------------------------------------------------
     */

    const { data: reservation, error: reservationError } =
      await supabaseAdmin
        .from("reservations")
        .select(
          `
          id,
          club_id,
          resource_id,
          customer_name,
          customer_email,
          starts_at,
          ends_at,
          deposit_amount,
          amount_paid,
          payment_status,
          payment_id,
          status
          `,
        )
        .eq("id", externalReference)
        .maybeSingle();

    if (reservationError) {
      console.error("Error buscando reserva:", reservationError);

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: false,
        error: "Error buscando reserva",
      });
    }

    if (!reservation) {
      console.error("Reserva no encontrada:", externalReference);

      return res.status(200).json({
        ok: true,
        payment_found: true,
        reservation_found: false,
        external_reference: externalReference,
      });
    }

    /*
     * ---------------------------------------------------------
     * 9. Validar club
     * ---------------------------------------------------------
     */

    if (reservation.club_id !== sellerAccount.club_id) {
      console.error("INCONSISTENCIA DE CLUB:", {
        reservation_club_id: reservation.club_id,
        seller_club_id: sellerAccount.club_id,
        payment_id: payment.id,
        reservation_id: reservation.id,
      });

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: true,
        error: "La reserva no pertenece al club de la cuenta Mercado Pago",
      });
    }

    /*
     * ---------------------------------------------------------
     * 10. Validar importe
     * ---------------------------------------------------------
     */

    const expectedAmount = Number(reservation.deposit_amount);
    const paidAmount = Number(payment.transaction_amount);

    if (!Number.isFinite(expectedAmount) || !Number.isFinite(paidAmount)) {
      console.error("Importe inválido:", {
        expectedAmount,
        paidAmount,
      });

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: true,
        error: "Importe inválido",
      });
    }

    if (expectedAmount !== paidAmount) {
      console.error("INCONSISTENCIA DE IMPORTE:", {
        expected_amount: expectedAmount,
        paid_amount: paidAmount,
        reservation_id: reservation.id,
        payment_id: payment.id,
      });

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: true,
        error: "El importe del pago no coincide con la seña",
      });
    }

    /*
     * ---------------------------------------------------------
     * 11. Idempotencia
     * ---------------------------------------------------------
     */

    if (
      reservation.payment_id &&
      String(reservation.payment_id) === String(payment.id)
    ) {
      console.log("Pago ya procesado:", payment.id);

      return res.status(200).json({
        ok: true,
        payment_found: true,
        reservation_found: true,
        already_processed: true,
        payment: {
          id: payment.id,
          status: payment.status,
          transaction_amount: payment.transaction_amount,
          external_reference: payment.external_reference,
        },
        reservation: {
          id: reservation.id,
          club_id: reservation.club_id,
          payment_id: reservation.payment_id,
          payment_status: reservation.payment_status,
          status: reservation.status,
        },
      });
    }

    /*
     * ---------------------------------------------------------
     * 12. Determinar estado
     * ---------------------------------------------------------
     */

    const updateData: Record<string, unknown> = {
      payment_id: String(payment.id),
      updated_at: new Date().toISOString(),
    };

    if (payment.status === "approved") {
      updateData.amount_paid = paidAmount;
      updateData.payment_status = "approved";
      updateData.status = "confirmed";
    } else if (payment.status === "rejected") {
      updateData.payment_status = "rejected";
      updateData.status = "pending_payment";
    } else if (
      payment.status === "pending" ||
      payment.status === "in_process"
    ) {
      updateData.payment_status = "pending";
    } else {
      console.log(
        "Estado de Mercado Pago no procesado:",
        payment.status,
      );

      return res.status(200).json({
        ok: true,
        payment_found: true,
        reservation_found: true,
        ignored_status: payment.status,
      });
    }

    /*
     * ---------------------------------------------------------
     * 13. Actualizar reserva
     * ---------------------------------------------------------
     */

    const {
      data: updatedReservation,
      error: updateError,
    } = await supabaseAdmin
      .from("reservations")
      .update(updateData)
      .eq("id", reservation.id)
      .select(
        `
        id,
        club_id,
        amount_paid,
        payment_status,
        payment_id,
        status
        `,
      )
      .single();

    if (updateError) {
      console.error("Error actualizando reserva:", updateError);

      return res.status(200).json({
        ok: false,
        payment_found: true,
        reservation_found: true,
        error: "Error actualizando reserva",
        details: updateError,
      });
    }

    console.log(
      "Reserva actualizada correctamente:",
      updatedReservation,
    );

    /*
     * ---------------------------------------------------------
     * 14. ENVIAR EMAIL DE RESERVA CONFIRMADA
     * ---------------------------------------------------------
     */

    if (payment.status === "approved" && reservation.customer_email) {
      try {
        const [{ data: club }, { data: resource }] = await Promise.all([
          supabaseAdmin
            .from("clubs")
            .select("name, timezone")
            .eq("id", reservation.club_id)
            .maybeSingle(),

          supabaseAdmin
            .from("resources")
            .select("name")
            .eq("id", reservation.resource_id)
            .maybeSingle(),
        ]);

        if (!club) {
          console.error(
            "No se pudo obtener el club para el email.",
            reservation.club_id,
          );
        } else if (!resource) {
          console.error(
            "No se pudo obtener el recurso para el email.",
            reservation.resource_id,
          );
        } else {
          const date = formatInTimeZone(
            reservation.starts_at,
            club.timezone,
            "dd/MM/yyyy",
          );

          const startTime = formatInTimeZone(
            reservation.starts_at,
            club.timezone,
            "HH:mm",
          );

          const endTime = formatInTimeZone(
            reservation.ends_at,
            club.timezone,
            "HH:mm",
          );

          const email = reservationConfirmedTemplate({
            customerName: reservation.customer_name,
            clubName: club.name,
            resourceName: resource.name,
            date,
            startTime,
            endTime,
            amount: Number(reservation.amount_paid ?? 0),
            depositAmount: Number(reservation.deposit_amount ?? 0),
          });

          const appUrl = process.env.PUBLIC_APP_URL?.replace(/\/+$/, "");

          if (!appUrl) {
            console.error(
              "Falta PUBLIC_APP_URL. No se puede enviar el email.",
            );
          } else {
            const emailResponse = await fetch(
              `${appUrl}/api/notifications/send-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  to: reservation.customer_email,
                  subject: email.subject,
                  html: email.html,
                }),
              },
            );

            const emailData = await emailResponse.json();

            if (!emailResponse.ok) {
              console.error(
                "No se pudo enviar el email de reserva confirmada:",
                emailData,
              );
            } else {
              console.log(
                "Email de reserva confirmada enviado:",
                {
                  reservation_id: reservation.id,
                  email: reservation.customer_email,
                  email_id: emailData?.id,
                },
              );
            }
          }
        }
      } catch (emailError) {
        console.error(
          "Error enviando email de reserva confirmada:",
          emailError,
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 15. Respuesta final
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      ok: true,
      payment_found: true,
      reservation_found: true,
      payment: {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        external_reference: payment.external_reference,
        collector_id: payment.collector_id,
      },
      seller: {
        club_id: sellerAccount.club_id,
        mp_user_id: sellerAccount.mp_user_id,
      },
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);

    /*
     * Durante desarrollo devolvemos 200.
     */

    return res.status(200).json({
      ok: false,
      error: "Error procesando webhook",
    });
  }
}