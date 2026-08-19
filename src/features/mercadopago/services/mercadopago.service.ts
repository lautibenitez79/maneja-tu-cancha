import { supabase } from "@/lib/supabase";

import type { MercadoPagoConnection } from "../types/mercadopago.types";

class MercadoPagoService {
  async getConnection(
    clubId: string,
  ): Promise<MercadoPagoConnection | null> {
    const { data, error } = await supabase
      .from("mercadopago_connections")
      .select(
        `
        id,
        club_id,
        mp_user_id,
        public_key,
        live_mode,
        expires_at,
        active,
        created_at,
        updated_at
        `,
      )
      .eq("club_id", clubId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as MercadoPagoConnection | null;
  }

  async getAuthorizationUrl(): Promise<string> {
    const response = await fetch(
      "/api/mercadopago/oauth/authorize",
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(
        "No se pudo iniciar la conexión con Mercado Pago.",
      );
    }

    const data = await response.json();

    return data.url;
  }
}

export const mercadoPagoService =
  new MercadoPagoService();