import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type SubscriptionPlan =
  | "monthly"
  | "three_months"
  | "annual"
  | "test";

interface PlanConfig {
  amount: number;
  frequency: number;
  frequencyType: "months";
}

const PLAN_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  monthly: {
    amount: 60000,
    frequency: 1,
    frequencyType: "months",
  },

  /*
   * La promoción es:
   * $160.000 ahora
   * siguiente cobro en el mes 4.
   *
   * Por eso la recurrencia es cada 4 meses.
   */
  three_months: {
    amount: 160000,
    frequency: 4,
    frequencyType: "months",
  },

  annual: {
    amount: 480000,
    frequency: 12,
    frequencyType: "months",
  },

  test: {
    amount: 100,
    frequency: 1,
    frequencyType: "months",
  },
};

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

  const accessToken = String(
    data?.access_token ?? "",
  ).trim();

  if (!accessToken) {
    throw new Error(
      "Mercado Pago no devolvió un Access Token.",
    );
  }

  const expiresInSeconds = Number(
    data?.expires_in ?? 21600,
  );

  cachedAccessToken = accessToken;

  cachedAccessTokenExpiresAt =
    now +
    Math.max(expiresInSeconds - 300, 300) * 1000;

  return accessToken;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    /*
     * ---------------------------------------------------------
     * 1. Validar sesión
     * ---------------------------------------------------------
     */

    const authorization = String(
      req.headers.authorization ?? "",
    ).trim();

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Falta el token de autenticación.",
      });
    }

    const accessToken = authorization
      .slice("Bearer ".length)
      .trim();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        error: "Sesión inválida o expirada.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 2. Obtener perfil
     * ---------------------------------------------------------
     */

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, club_id, role, email")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Error buscando perfil SaaS:",
        profileError,
      );

      return res.status(500).json({
        error: "No se pudo validar el perfil.",
      });
    }

    if (!profile?.club_id || profile.role !== "admin") {
      return res.status(403).json({
        error:
          "Solo el administrador del club puede contratar un plan.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. Validar plan
     * ---------------------------------------------------------
     */

    const plan = String(
      req.body?.plan ?? "",
    ) as SubscriptionPlan;

    const payerEmail = String(
      req.body?.payer_email ?? "",
    )
      .trim()
      .toLowerCase();

    const validPlans: SubscriptionPlan[] = [
      "monthly",
      "three_months",
      "annual",
      "test",
    ];

    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        error: "Plan inválido.",
      });
    }

    if (!payerEmail || !payerEmail.includes("@")) {
      return res.status(400).json({
        error:
          "Ingresá un email válido de Mercado Pago.",
      });
    }

    const planConfig = PLAN_CONFIG[plan];

    /*
     * ---------------------------------------------------------
     * 4. Obtener Access Token Mercado Pago
     * ---------------------------------------------------------
     */

    const mpAccessToken =
      await getMercadoPagoAccessToken();

    /*
     * ---------------------------------------------------------
     * 5. Crear external_reference
     * ---------------------------------------------------------
     *
     * Este valor será la forma segura de asociar
     * la suscripción con nuestro club.
     *
     * NO usamos el email del administrador para eso.
     */

    const externalReference =
      `saas:club:${profile.club_id}:plan:${plan}`;

    /*
     * ---------------------------------------------------------
     * 6. Crear suscripción SIN plan asociado
     * ---------------------------------------------------------
     *
     * Mercado Pago permite crearla en estado pending.
     * El comprador completa posteriormente el medio
     * de pago desde el checkout.
     */

    const response = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          reason: "Maneja Tu Cancha",

          external_reference:
            externalReference,

          payer_email: payerEmail,

          auto_recurring: {
            frequency:
              planConfig.frequency,

            frequency_type:
              planConfig.frequencyType,

            transaction_amount:
              planConfig.amount,

            currency_id: "ARS",
          },

          back_url:
            "https://www.manejatucancha.com.ar/dashboard/subscription",

          status: "pending",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Error creando suscripción SaaS en Mercado Pago:",
        {
          status: response.status,
          data,
          club_id: profile.club_id,
          plan,
        },
      );

      return res.status(response.status).json({
        error:
          data?.message ??
          data?.error ??
          "Mercado Pago no pudo crear la suscripción.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 7. Validar checkout
     * ---------------------------------------------------------
     */

    if (!data?.init_point) {
      console.error(
        "Mercado Pago no devolvió init_point:",
        data,
      );

      return res.status(502).json({
        error:
          "Mercado Pago no devolvió el checkout.",
      });
    }

    /*
     * ---------------------------------------------------------
     * 8. Respuesta
     * ---------------------------------------------------------
     */

    console.log(
      "Suscripción SaaS pendiente creada:",
      {
        club_id: profile.club_id,
        plan,
        payer_email: payerEmail,
        external_reference:
          externalReference,
        preapproval_id: data.id,
      },
    );

    return res.status(200).json({
      ok: true,

      plan,

      club_id: profile.club_id,

      external_reference:
        externalReference,

      preapproval_id: data.id,

      init_point: data.init_point,

      status: data.status,
    });
  } catch (error) {
    console.error(
      "Error creando checkout SaaS:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el pago.",
    });
  }
}