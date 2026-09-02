import { supabase } from "@/lib/supabase";

import type { MercadoPagoConnection } from "../types/mercadopago.types";

interface CreatePreferenceParams {
  clubId: string;
  reservationId?: string;
  gymMonthlyFeeId?: string;
}

interface CreatePreferenceResponse {
  success: boolean;
  preference_id: string;
  collector_id: string;
  seller_mp_user_id: string;
  marketplace_fee: number;
  init_point: string;
  sandbox_init_point: string;
  external_reference: string;
}

class MercadoPagoService {
  async getConnection(clubId: string): Promise<MercadoPagoConnection | null> {
    const { data, error } = await supabase
      .from("mercadopago_connections_public")
      .select(
        `
        club_id,
        mp_user_id,
        token_type,
        expires_at,
        active,
        created_at,
        updated_at
        `,
      )
      .eq("club_id", clubId)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("Error obteniendo conexión Mercado Pago:", error);

      throw error;
    }

    if (!data) {
      return null;
    }

    return data;
  }

  getAuthorizationUrl(clubId: string): string {
    return `/api/mercadopago/oauth/authorize?club_id=${encodeURIComponent(
      clubId,
    )}`;
  }

  async createPreference(
    params: CreatePreferenceParams,
  ): Promise<CreatePreferenceResponse> {
    const { clubId, reservationId, gymMonthlyFeeId } = params;

    const response = await fetch("/api/mercadopago/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        club_id: clubId,
        reservation_id: reservationId,
        gym_monthly_fee_id: gymMonthlyFeeId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "No se pudo crear el pago con Mercado Pago.",
      );
    }

    return data;
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