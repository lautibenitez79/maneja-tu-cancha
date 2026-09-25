import type {
  FootballFormat,
  ResourceSurface,
  ResourceType,
} from "../../types/resource.types";

interface Props {
  type: ResourceType;

  covered: boolean | null;
  surface: ResourceSurface | null;
  footballFormat: FootballFormat | null;
  lighting: boolean | null;
  beelup: boolean | null;

  onCoveredChange(value: boolean): void;
  onSurfaceChange(value: ResourceSurface): void;
  onFootballFormatChange(value: FootballFormat): void;
  onLightingChange(value: boolean): void;
  onBeelupChange(value: boolean): void;

  onBack(): void;
  onNext(): void;
}

function BooleanField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange(value: boolean): void;
}) {
  return (
    <div>
      <label className="mb-2 block font-medium">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-lg border p-3 transition ${
            value === true
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-slate-200 bg-white"
          }`}
        >
          Sí
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-lg border p-3 transition ${
            value === false
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-slate-200 bg-white"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default function StepCharacteristics({
  type,
  covered,
  surface,
  footballFormat,
  lighting,
  beelup,
  onCoveredChange,
  onSurfaceChange,
  onFootballFormatChange,
  onLightingChange,
  onBeelupChange,
  onBack,
  onNext,
}: Props) {
  const isFootball = type === "football";
  const isPadel = type === "padel";
  const isTennis = type === "tennis";
  const isGym = type === "gym";

  const needsCovered = isFootball || isPadel || isTennis || isGym;
  const needsSurface = isFootball || isPadel;

  function handleNext() {
    if (needsCovered && covered === null) {
      return;
    }

    if (needsSurface && surface === null) {
      return;
    }

    if (isFootball && footballFormat === null) {
      return;
    }

    if (isFootball && lighting === null) {
      return;
    }

    if (isFootball && beelup === null) {
      return;
    }

    onNext();
  }

  const canContinue =
    (!needsCovered || covered !== null) &&
    (!needsSurface || surface !== null) &&
    (!isFootball || footballFormat !== null) &&
    (!isFootball || lighting !== null) &&
    (!isFootball || beelup !== null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">
          Características
        </h1>

        <p className="mt-2 text-[var(--color-muted)]">
          Configurá las características de este recurso.
        </p>
      </div>

      <div className="space-y-6">
        {needsCovered && (
          <BooleanField
            label={
              isGym
                ? "¿Es techado?"
                : "¿Es techada?"
            }
            value={covered}
            onChange={onCoveredChange}
          />
        )}

        {needsSurface && (
          <div>
            <label className="mb-2 block font-medium">
              Superficie
            </label>

            <select
              value={surface ?? ""}
              onChange={(e) =>
                onSurfaceChange(
                  e.target.value as ResourceSurface,
                )
              }
              className="w-full rounded-lg border p-3 bg-[var(--color-card)]"
            >
              <option value="" disabled>
                Seleccioná una superficie
              </option>

              <option value="synthetic">
                Sintético
              </option>

              <option value="floor">
                Piso
              </option>
            </select>
          </div>
        )}

        {isFootball && (
          <>
            <div>
              <label className="mb-2 block font-medium">
                Tipo de fútbol
              </label>

              <select
                value={footballFormat ?? ""}
                onChange={(e) =>
                  onFootballFormatChange(
                    e.target.value as FootballFormat,
                  )
                }
                className="w-full rounded-lg border p-3 bg-[var(--color-card)]"
              >
                <option value="" disabled>
                  Seleccioná el tipo
                </option>

                <option value="5">Fútbol 5</option>
                <option value="7">Fútbol 7</option>
                <option value="8">Fútbol 8</option>
                <option value="9">Fútbol 9</option>
                <option value="11">Fútbol 11</option>
              </select>
            </div>

            <BooleanField
              label="¿Cuenta con iluminación?"
              value={lighting}
              onChange={onLightingChange}
            />

            <BooleanField
              label="¿Cuenta con Beelup?"
              value={beelup}
              onChange={onBeelupChange}
            />
          </>
        )}
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
          disabled={!canContinue}
          onClick={handleNext}
          className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}