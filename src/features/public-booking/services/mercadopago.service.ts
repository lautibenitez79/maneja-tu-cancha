interface CreatePreferenceResponse {
  success: boolean;
  preference_id: string;
  collector_id: number;
  seller_mp_user_id: string;
  marketplace_fee: number;
  init_point: string;
  sandbox_init_point: string;
}

class MercadoPagoService {
  async createPreference({
    clubId,
    reservationId,
    gymMonthlyFeeId,
  }: {
    clubId: string;
    reservationId?: string;
    gymMonthlyFeeId?: string;
  }): Promise<CreatePreferenceResponse> {
    const response = await fetch("/api/mercadopago/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clubId,
        ...(reservationId ? { reservationId } : {}),
        ...(gymMonthlyFeeId ? { gymMonthlyFeeId } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error creando Preference:", data);

      throw new Error(data?.error || "No se pudo iniciar el pago.");
    }

    return data;
  }
}

export const mercadoPagoService = new MercadoPagoService();
