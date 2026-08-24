import { supabase } from "@/lib/supabase";

import type { MercadoPagoConnection } from "../types/mercadopago.types";

class MercadoPagoService {
  async getConnection(
    clubId: string,
  ): Promise<MercadoPagoConnection | null> {
    const { data, error } = await supabase
      .from("club_marketplace_accounts")
      .select(
        `
        club_id,
        mp_user_id,
        token_type,
        scope,
        expires_at,
        created_at,
        updated_at
        `,
      )
      .eq("club_id", clubId)
      .eq("provider", "mercadopago")
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
}

export const mercadoPagoService =
  new MercadoPagoService();