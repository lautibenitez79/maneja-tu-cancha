interface StepSettingsProps {
  timezone: string;
  currency: string;

  onTimezoneChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;

  onBack: () => void;
  onSubmit: () => void;

  loading?: boolean;
}

export default function StepSettings({
  timezone,
  currency,
  onTimezoneChange,
  onCurrencyChange,
  onBack,
  onSubmit,
  loading = false,
}: StepSettingsProps) {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-black">
          ⚙ Configuración
        </h1>

        <p className="mt-2 text-[var(--color-muted)]">
          Últimos datos para crear tu complejo.
        </p>
      </div>

      <div className="space-y-5">

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Zona horaria
          </label>

          <select
            className="w-full rounded-lg border p-3 text-black border-black"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
          >
            <option value="America/Argentina/Buenos_Aires">
              America/Argentina/Buenos_Aires
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Moneda
          </label>

          <select
            className="w-full rounded-lg border p-3 text-black border-black"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            <option value="ARS">ARS</option>
          </select>
        </div>

      </div>

      <div className="flex gap-4">

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-lg border py-3"
        >
          Atrás
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear complejo"}
        </button>

      </div>

    </div>
  );
}