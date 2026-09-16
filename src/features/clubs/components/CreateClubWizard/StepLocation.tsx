interface StepLocationProps {
  address: string;
  city: string;
  province: string;
  country: string;
  logoFile: File | null;

  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onLogoChange: (file: File | null) => void;

  onBack: () => void;
  onNext: () => void;
}

export default function StepLocation({
  address,
  city,
  province,
  country,
  logoFile,
  onAddressChange,
  onCityChange,
  onProvinceChange,
  onCountryChange,
  onLogoChange,
  onBack,
  onNext,
}: StepLocationProps) {
  function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      onLogoChange(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("El logo debe ser JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("El logo no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    onLogoChange(file);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-black">
          📍 Ubicación
        </h1>

        <p className="mt-2 text-[var(--color-muted)]">
          ¿Dónde se encuentra tu complejo?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Dirección
          </label>

          <input
            className="w-full rounded-lg border border-black p-3 text-black"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Ciudad
          </label>

          <input
            className="w-full rounded-lg border border-black p-3 text-black"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Provincia
          </label>

          <input
            className="w-full rounded-lg border border-black p-3 text-black"
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            País
          </label>

          <select
            className="w-full rounded-lg border border-black p-3 text-black"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            required
          >
            <option value="Argentina">Argentina</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-black">
            Logo del complejo
          </label>

          <p className="mb-3 text-xs text-[var(--color-muted)]">
            Opcional. JPG, PNG o WEBP. Máximo 5 MB.
          </p>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/30 p-6 text-center transition hover:bg-black/[0.03]">
            {logoFile ? (
              <>
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Vista previa del logo"
                  className="mb-4 h-24 w-24 rounded-xl object-cover"
                />

                <span className="text-sm font-medium text-black">
                  {logoFile.name}
                </span>

                <span className="mt-1 text-xs text-[var(--color-muted)]">
                  Hacé clic para cambiarlo
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-black">
                  Seleccionar logo
                </span>

                <span className="mt-1 text-xs text-[var(--color-muted)]">
                  Podés dejarlo vacío
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
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