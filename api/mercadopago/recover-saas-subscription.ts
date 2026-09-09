import type { VercelRequest, VercelResponse } from "@vercel/node";

let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiresAt = 0;

async function getMercadoPagoAccessToken() {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan MERCADOPAGO_CLIENT_ID o MERCADOPAGO_CLIENT_SECRET.",
    );
  }

  const now = Date.now();

  if (cachedAccessToken && now < cachedAccessTokenExpiresAt) {
    return cachedAccessToken;
  }

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

    throw new Error(
      `Mercado Pago no pudo emitir el Access Token: ${response.status} ${body}`,
    );
  }

  const data = await response.json();

  const accessToken = String(data?.access_token ?? "").trim();

  if (!accessToken) {
    throw new Error("Mercado Pago no devolvió un Access Token.");
  }

  const expiresInSeconds = Number(data?.expires_in ?? 21600);

  cachedAccessToken = accessToken;
  cachedAccessTokenExpiresAt =
    now + Math.max(expiresInSeconds - 300, 300) * 1000;

  return accessToken;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    const payerEmail = String(req.query.email ?? "")
      .trim()
      .toLowerCase();

    if (!payerEmail || !payerEmail.includes("@")) {
      return res.status(400).json({
        error: "Falta un email válido.",
      });
    }

    const accessToken = await getMercadoPagoAccessToken();

    const searchUrl =
      `https://api.mercadopago.com/preapproval/search` +
      `?payer_email=${encodeURIComponent(payerEmail)}`;

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error(
        "Error buscando suscripciones Mercado Pago:",
        searchData,
      );

      return res.status(searchResponse.status).json({
        error:
          searchData?.message ??
          searchData?.error ??
          "No se pudieron buscar las suscripciones.",
      });
    }

    const subscriptions = Array.isArray(searchData?.results)
      ? searchData.results
      : [];

    const simplifiedSubscriptions = subscriptions.map(
      (subscription: any) => ({
        id: subscription?.id ?? null,
        status: subscription?.status ?? null,
        reason: subscription?.reason ?? null,
        external_reference:
          subscription?.external_reference ?? null,
        preapproval_plan_id:
          subscription?.preapproval_plan_id ?? null,
        payer_id: subscription?.payer_id ?? null,
        payer_email: subscription?.payer_email ?? payerEmail,
        payment_method_id:
          subscription?.payment_method_id ?? null,
        next_payment_date:
          subscription?.next_payment_date ?? null,
        date_created:
          subscription?.date_created ?? null,
        last_modified:
          subscription?.last_modified ?? null,
        auto_recurring:
          subscription?.auto_recurring ?? null,
        summarized:
          subscription?.summarized ?? null,
      }),
    );

    const relevantSubscriptions = simplifiedSubscriptions.filter(
      (subscription: any) => {
        const reference = String(
          subscription.external_reference ?? "",
        );

        return (
          reference.startsWith("saas:club:") ||
          String(subscription.reason ?? "")
            .toLowerCase()
            .includes("maneja tu cancha")
        );
      },
    );

    const subscriptionsToInspect =
      relevantSubscriptions.length > 0
        ? relevantSubscriptions
        : simplifiedSubscriptions;

    const authorizedPayments = [];

    for (const subscription of subscriptionsToInspect) {
      if (!subscription.id) continue;

      const paymentsUrl =
        `https://api.mercadopago.com/authorized_payments/search` +
        `?preapproval_id=${encodeURIComponent(subscription.id)}`;

      const paymentsResponse = await fetch(paymentsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const paymentsData = await paymentsResponse.json();

      if (!paymentsResponse.ok) {
        authorizedPayments.push({
          preapproval_id: subscription.id,
          error:
            paymentsData?.message ??
            paymentsData?.error ??
            "No se pudieron consultar las facturas.",
        });

        continue;
      }

      const results = Array.isArray(paymentsData?.results)
        ? paymentsData.results
        : [];

      authorizedPayments.push({
        preapproval_id: subscription.id,
        results,
      });
    }

    return res.status(200).json({
      ok: true,
      payer_email: payerEmail,
      total_subscriptions: subscriptions.length,
      subscriptions: subscriptionsToInspect,
      authorized_payments: authorizedPayments,
    });
  } catch (error) {
    console.error(
      "Error recuperando suscripción SaaS:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "No se pudo recuperar la suscripción.",
    });
  }
}