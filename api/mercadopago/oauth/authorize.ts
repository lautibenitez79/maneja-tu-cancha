import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const clubId = req.query.club_id;

  if (typeof clubId !== "string" || !clubId) {
    return res.status(400).json({
      error: "Falta club_id",
    });
  }

  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

  console.log("Mercado Pago OAuth:", {
    clubId,
    redirectUri,
  });

  if (!clientId) {
    return res.status(500).json({
      error: "Falta MERCADOPAGO_CLIENT_ID",
    });
  }

  if (!redirectUri) {
    return res.status(500).json({
      error: "Falta MERCADOPAGO_REDIRECT_URI",
    });
  }

  const state = Buffer.from(
    JSON.stringify({
      clubId,
      nonce: crypto.randomUUID(),
    }),
  ).toString("base64url");

  const authorizationUrl = new URL(
    "https://auth.mercadopago.com.ar/authorization",
  );

  authorizationUrl.searchParams.set(
    "client_id",
    clientId,
  );

  authorizationUrl.searchParams.set(
    "response_type",
    "code",
  );

  authorizationUrl.searchParams.set(
    "platform_id",
    "mp",
  );

  authorizationUrl.searchParams.set(
    "redirect_uri",
    redirectUri,
  );

  authorizationUrl.searchParams.set(
    "state",
    state,
  );

  console.log(
    "Mercado Pago Authorization URL:",
    authorizationUrl.toString(),
  );

  return res.redirect(
    302,
    authorizationUrl.toString(),
  );
}