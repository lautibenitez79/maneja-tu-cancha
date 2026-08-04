interface StepLocationProps {
  address: string;
  city: string;
  province: string;
  country: string;

  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCountryChange: (value: string) => void;

  onBack: () => void;
  onNext: () => void;
}

export default function StepLocation({
  address,
  city,
  province,
  country,
  onAddressChange,
  onCityChange,
  onProvinceChange,
  onCountryChange,
  onBack,
  onNext,
}: StepLocationProps) {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-black">
          📍 Ubicación
        </h1>

        <p className="mt-2 text-gray-500">
          ¿Dónde se encuentra tu complejo?
        </p>
      </div>

      <div className="space-y-5">

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Dirección
          </label>

          <input
            className="w-full rounded-lg border p-3 text-black border-black"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Ciudad
          </label>

          <input
            className="w-full rounded-lg border p-3 text-black border-black"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Provincia
          </label>

          <input
            className="w-full rounded-lg border p-3 text-black border-black"
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            País
          </label>

          <select
            className="w-full rounded-lg border p-3 text-black border-black"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            <option value="Argentina">
              Argentina
            </option>
          </select>
        </div>

      </div>

      <div className="flex gap-4">

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-lg border py-3 text-black"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white"
        >
          Continuar
        </button>

      </div>

    </div>
  );
}