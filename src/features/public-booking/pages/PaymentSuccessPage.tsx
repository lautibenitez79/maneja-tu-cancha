import { Link } from "react-router-dom";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border bg-[var(--color-card)] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[var(--color-title)]">
            ¡Pago realizado!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Recibimos tu pago correctamente. Tu reserva quedó registrada y
            estamos procesando la confirmación.
          </p>

          <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-left">
            <p className="text-sm font-medium text-[var(--color-title)]">
              ¿Qué sigue?
            </p>

            <p className="mt-1 text-sm text-slate-500">
              La confirmación de la reserva se realiza automáticamente cuando
              Mercado Pago informa el pago.
            </p>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white transition hover:opacity-90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}