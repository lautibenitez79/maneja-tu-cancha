import { Link } from "react-router-dom";

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border bg-[var(--color-card)] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl text-yellow-600">
            ⏳
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[var(--color-title)]">
            Pago pendiente
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Mercado Pago todavía no confirmó el pago.
          </p>

          <div className="mt-6 rounded-xl border border-yellow-100 bg-yellow-50 p-4 text-left">
            <p className="text-sm font-medium text-yellow-700">
              Estamos esperando la confirmación
            </p>

            <p className="mt-1 text-sm text-yellow-600">
              Cuando Mercado Pago confirme la operación, la reserva se
              actualizará automáticamente.
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