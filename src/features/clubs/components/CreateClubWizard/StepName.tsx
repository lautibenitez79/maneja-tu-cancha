interface StepNameProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export default function StepName({
  value,
  onChange,
  onNext,
}: StepNameProps) {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-black">
          Bienvenido 👋
        </h1>

        <p className="mt-2 text-gray-200">
          Comencemos creando tu complejo deportivo.
        </p>
      </div>

      <div className="space-y-2">

        <label className="text-sm font-medium">
          Nombre del complejo
        </label>

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Ej: Complejo La Canchita"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-lg bg-[var(--color-primary)] py-3 font-medium text-white"
      >
        Continuar
      </button>

    </div>
  );
}