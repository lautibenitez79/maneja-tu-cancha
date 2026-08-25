import { supabase } from "@/lib/supabase";

import type { MercadoPagoConnection } from "../types/mercadopago.types";

class MercadoPagoService {
  async getConnection(clubId: string): Promise<MercadoPagoConnection | null> {
    const { data, error } = await supabase
      .from("club_marketplace_accounts")
      .select(
        `
        club_id,
        mp_user_id,
        token_type,
        scope,
        expires_at,
        active,
        created_at,
        updated_at
        `,
      )
      .eq("club_id", clubId)
      .eq("provider", "mercadopago")
      .eq("active", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      active: true,
    };
  }

  getAuthorizationUrl(clubId: string): string {
    return `/api/mercadopago/oauth/authorize?club_id=${encodeURIComponent(
      clubId,
    )}`;
  }

  async disconnect(clubId: string): Promise<void> {
    const response = await fetch("/api/mercadopago/disconnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        club_id: clubId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo desconectar Mercado Pago.");
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();
