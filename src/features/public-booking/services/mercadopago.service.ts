interface CreatePreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

class MercadoPagoService {
  async createPreference({
    reservationId,
    title,
    amount,
    customerEmail,
  }: {
    reservationId: string;
    title: string;
    amount: number;
    customerEmail: string;
  }): Promise<CreatePreferenceResponse> {
    const response = await fetch(
      "/api/mercadopago/create-preference",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          reservationId,
          title,
          amount,
          customerEmail,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "No se pudo iniciar el pago.",
      );
    }

    return data;
  }
}

export const mercadoPagoService =
  new MercadoPagoService();