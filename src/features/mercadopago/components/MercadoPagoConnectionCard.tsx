import { useEffect, useState } from "react";

import { mercadoPagoService } from "../services/mercadopago.service";
import type { MercadoPagoConnection } from "../types/mercadopago.types";

interface Props {
  clubId: string;
}

export default function MercadoPagoConnectionCard({ clubId }: Props) {
  const [connection, setConnection] = useState<MercadoPagoConnection | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data =
          await mercadoPagoService.getConnection(clubId);

        console.log("=== MERCADO PAGO CONNECTION ===");
        console.log("clubId:", clubId);
        console.log("connection:", data);

        setConnection(data);
      } catch (error) {
        console.error(
          "Error cargando conexión Mercado Pago:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [clubId]);

  async function handleConnect() {
    try {
      setConnecting(true);

      const url = mercadoPagoService.getAuthorizationUrl(clubId);

      window.location.href = url;
    } catch (error) {
      console.error(error);

      alert("No se pudo iniciar la conexión con Mercado Pago.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    const confirmed = window.confirm(
      "¿Querés desconectar tu cuenta de Mercado Pago?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setConnecting(true);

      await mercadoPagoService.disconnect(clubId);

      setConnection(null);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo desconectar Mercado Pago.",
      );
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-6">Cargando Mercado Pago...</div>
    );
  }

  return (
    <div className="rounded-xl border bg-[var(--color-card)] p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Mercado Pago</h2>

        <p className="mt-1 text-sm opacity-70">
          Conectá la cuenta de Mercado Pago donde recibirás las señas de tus
          reservas.
        </p>
      </div>

      {connection?.active ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            Mercado Pago conectado correctamente.
          </div>

          <div className="text-sm">
            <strong>Cuenta conectada:</strong>{" "}
            {connection.mp_user_id}
          </div>

          {connection.expires_at && (
            <div className="text-sm opacity-70">
              Conexión válida hasta:{" "}
              {new Date(
                connection.expires_at,
              ).toLocaleDateString("es-AR")}
            </div>
          )}

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={connecting}
            className="rounded-lg border px-5 py-3 font-medium transition disabled:opacity-50"
          >
            {connecting
              ? "Desconectando..."
              : "Desconectar Mercado Pago"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className="rounded-lg px-5 py-3 font-medium text-white transition disabled:opacity-50"
          style={{
            backgroundColor: "#009EE3",
          }}
        >
          {connecting ? "Conectando..." : "Conectar Mercado Pago"}
        </button>
      )}
    </div>
  );
}
