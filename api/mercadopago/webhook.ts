import type { VercelRequest, VercelResponse } from "@vercel/node";
import { formatInTimeZone } from "date-fns-tz";
import { reservationConfirmedTemplate } from "../../src/features/notifications/templates/reservationConfirmed.js";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);


let cachedSaasAccessToken: string | null = null;
let cachedSaasAccessTokenExpiresAt = 0;

async function getSaasAccessToken() {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "Faltan MERCADOPAGO_CLIENT_ID o MERCADOPAGO_CLIENT_SECRET para obtener el Access Token SaaS.",
    );
    return null;
  }

  const now = Date.now();

  if (cachedSaasAccessToken && now < cachedSaasAccessTokenExpiresAt) {
    return cachedSaasAccessToken;
  }

  try {
    const response = await fetch(
      "https://api.mercadopago.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("Error obteniendo Access Token SaaS:", {
        status: response.status,
        body,
      });
      return null;
    }

    const data = await response.json();
    const accessToken = String(data?.access_token ?? "").trim();

    if (!accessToken) {
      console.error("Mercado Pago no devolvió Access Token SaaS.");
      return null;
    }

    const expiresInSeconds = Number(data?.expires_in ?? 21600);

    cachedSaasAccessToken = accessToken;
    cachedSaasAccessTokenExpiresAt =
      now + Math.max(expiresInSeconds - 300, 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error("Error solicitando Access Token SaaS:", error);
    return null;
  }
}

async function fetchMercadoPagoJson(url: string, accessToken: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function getSaasPlanIdMap() {
  return {
    monthly: process.env.MERCADOPAGO_SAAS_PLAN_MONTHLY_ID,
    three_months: process.env.MERCADOPAGO_SAAS_PLAN_THREE_MONTHS_ID,
    annual: process.env.MERCADOPAGO_SAAS_PLAN_ANNUAL_ID,
    test: process.env.MERCADOPAGO_SAAS_PLAN_TEST_ID,
  } as const;
}

async function findSaasPreapproval(
  payerEmail: string,
  payment: any,
  accessToken: string,
) {
  const directId =
    payment?.preapproval_id ??
    payment?.preapproval_plan_id ??
    payment?.metadata?.preapproval_id;

  if (directId) {
    const direct = await fetchMercadoPagoJson(
      `https://api.mercadopago.com/preapproval/${encodeURIComponent(String(directId))}`,
      accessToken,
    );

    if (direct?.id) {
      return direct;
    }
  }

  const searchUrl =
    `https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(payerEmail)}`;

  const searchResult = await fetchMercadoPagoJson(searchUrl, accessToken);
  const results = Array.isArray(searchResult?.results)
    ? searchResult.results
    : [];

  if (!results.length) {
    return null;
  }

  const planIds = Object.values(getSaasPlanIdMap()).filter(Boolean);

  return (
    results.find(
      (item: any) =>
        planIds.includes(String(item?.preapproval_plan_id ?? "")) &&
        ["authorized", "active"].includes(String(item?.status ?? "")),
    ) ??
    results.find((item: any) =>
      planIds.includes(String(item?.preapproval_plan_id ?? "")),
    ) ??
    results[0]
  );
}

function resolveSaasPlan(preapproval: any) {
  const planIds = getSaasPlanIdMap();
  const planId = String(preapproval?.preapproval_plan_id ?? "");

  if (planId && planId === planIds.monthly) return "monthly" as const;
  if (planId && planId === planIds.three_months) {
    return "three_months" as const;
  }
  if (planId && planId === planIds.annual) return "annual" as const;
  if (planId && planId === planIds.test) return "test" as const;

  return null;
}

async function processSaasPayment(paymentId: string) {
  const accessToken = await getSaasAccessToken();

  if (!accessToken) {
    return null;
  }

  const payment = await fetchMercadoPagoJson(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    accessToken,
  );

  if (!payment?.id) {
    return null;
  }

  /*
   * Para SaaS la asociación NO se hace por email.
   *
   * El pago puede ser realizado desde una cuenta de Mercado Pago
   * distinta de la cuenta del administrador de Maneja Tu Cancha.
   *
   * La relación segura es:
   *
   *   preapproval.external_reference
   *     -> saas:club:{club_id}:plan:{plan}
   *
   * El email del pagador se usa únicamente como fallback para
   * localizar la preapproval cuando Mercado Pago no entrega
   * directamente su ID dentro del pago.
   */

  const payerEmail = String(payment?.payer?.email ?? "")
    .trim()
    .toLowerCase();

  const preapproval = await findSaasPreapproval(
    payerEmail,
    payment,
    accessToken,
  );

  if (!preapproval?.id) {
    console.log("Pago SaaS sin preapproval identificable:", {
      payment_id: paymentId,
      payer_email: payerEmail || null,
    });

    return null;
  }

  const externalReference = String(
    preapproval?.external_reference ?? "",
  ).trim();

  const referenceMatch = externalReference.match(
    /^saas:club:([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):plan:(monthly|three_months|annual|test)$/i,
  );

  if (!referenceMatch) {
    console.log("Preapproval sin external_reference SaaS válido:", {
      payment_id: paymentId,
      preapproval_id: preapproval.id,
      external_reference: externalReference || null,
    });

    return null;
  }

  const clubId = referenceMatch[1];
  const planFromReference = referenceMatch[2].toLowerCase() as
    | "monthly"
    | "three_months"
    | "annual"
    | "test";

  const { data: club, error: clubError } = await supabaseAdmin
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .maybeSingle();

  if (clubError) {
    console.error("Error validando club de suscripción SaaS:", clubError);
    return null;
  }

  if (!club?.id) {
    console.error("El external_reference apunta a un club inexistente:", {
      payment_id: paymentId,
      club_id: clubId,
      external_reference: externalReference,
    });

    return null;
  }

  const planFromMp = resolveSaasPlan(preapproval);

  if (!planFromMp) {
    console.error("No se pudo identificar el plan SaaS desde Mercado Pago:", {
      payment_id: paymentId,
      preapproval_id: preapproval.id,
      preapproval_plan_id: preapproval?.preapproval_plan_id,
      external_reference: externalReference,
    });

    return null;
  }

  if (planFromMp !== planFromReference) {
    console.error("INCONSISTENCIA DE PLAN SaaS:", {
      payment_id: paymentId,
      preapproval_id: preapproval.id,
      plan_from_reference: planFromReference,
      plan_from_mercadopago: planFromMp,
      external_reference: externalReference,
    });

    return null;
  }

  const plan = planFromReference;

  const now = new Date();
  const nowIso = now.toISOString();
  const startDate =
    preapproval?.start_date ?? preapproval?.date_created ?? nowIso;
  const nextPaymentDate = preapproval?.next_payment_date ?? null;

  const status =
    payment.status === "approved"
      ? "active"
      : payment.status === "rejected"
        ? "past_due"
        : null;

  if (!status) {
    console.log("Pago SaaS todavía no confirmado:", {
      payment_id: paymentId,
      status: payment.status,
      club_id: clubId,
      plan,
    });

    return {
      handled: true,
      payment_id: paymentId,
      club_id: clubId,
      plan,
      payment_status: payment.status,
    };
  }

  const subscriptionData = {
    club_id: clubId,
    plan,
    status,
    starts_at: startDate,
    current_period_start: startDate,
    current_period_end: nextPaymentDate ?? startDate,
    mercadopago_plan_id: String(preapproval.preapproval_plan_id),
    mercadopago_subscription_id: preapproval?.id
      ? String(preapproval.id)
      : null,
    mercadopago_payer_id: preapproval?.payer_id
      ? String(preapproval.payer_id)
      : payment?.payer?.id
        ? String(payment.payer.id)
        : null,
    last_payment_id: String(payment.id),
    last_payment_at: nowIso,
    next_payment_at: nextPaymentDate,
    access_type: "paid",
    access_until: null,
    updated_at: nowIso,
  };

  const { data: subscription, error: subscriptionError } =
    await supabaseAdmin
      .from("saas_subscriptions")
      .upsert(subscriptionData, { onConflict: "club_id" })
      .select(
        `
        id,
        club_id,
        plan,
        status,
        access_type,
        trial_starts_at,
        trial_ends_at,
        starts_at,
        current_period_start,
        current_period_end,
        mercadopago_plan_id,
        mercadopago_subscription_id,
        mercadopago_payer_id,
        last_payment_id,
        last_payment_at,
        next_payment_at,
        access_until,
        updated_at
        `,
      )
      .single();

  if (subscriptionError) {
    console.error("Error actualizando suscripción SaaS:", subscriptionError);

    return {
      handled: true,
      payment_id: paymentId,
      club_id: clubId,
      plan,
      error: "Error actualizando suscripción SaaS",
    };
  }

  console.log("Suscripción SaaS actualizada:", {
    club_id: clubId,
    plan,
    status,
    payment_id: paymentId,
    subscription_id: preapproval?.id,
    payer_id: preapproval?.payer_id ?? payment?.payer?.id ?? null,
    external_reference: externalReference,
  });

  return {
    handled: true,
    payment_id: paymentId,
    club_id: clubId,
    plan,
    status,
    subscription,
  };
}

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
     * 2. Suscripciones SaaS
     * ---------------------------------------------------------
     *
     * Las suscripciones de Maneja Tu Cancha cobran en la cuenta
     * Mercado Pago propia de la plataforma, no en las cuentas
     * OAuth de los clubes. Intentamos primero este flujo.
     * Si el pago no pertenece a la cuenta SaaS, devolvemos null
     * y continuamos exactamente con el flujo existente del club.
     */

    const saasResult = await processSaasPayment(paymentId);

    if (saasResult?.handled) {
      return res.status(200).json({
        ok: !saasResult.error,
        saas_subscription: true,
        ...saasResult,
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. Buscar cuentas Mercado Pago activas
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