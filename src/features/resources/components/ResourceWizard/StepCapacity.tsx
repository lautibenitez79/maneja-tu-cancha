import Button from "@/components/ui/Button/index";
import type { ResourceType } from "../../types/resource.types";

interface Props {
  type: ResourceType;

  capacity: number;

  loading: boolean;

  mode: "create" | "edit";

  onCapacityChange(value: number): void;

  onBack(): void;

  onSubmit(): void;
}

export default function StepCapacity({
  type,
  capacity,
  loading,
  mode,
  onCapacityChange,
  onBack,
  onSubmit,
}: Props) {
  const isGym = type === "gym";

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-3xl font-bold">
          Configuración
        </h1>

        <p className="mt-2 text-[var(--color-muted)]">
          {mode === "create"
            ? "Último paso para crear el recurso."
            : "Último paso para guardar los cambios."}
        </p>

      </div>

      {isGym ? (

        <div>

          <label className="mb-2 block font-medium">
            Cantidad máxima de personas por turno
          </label>

          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) =>
              onCapacityChange(
                Number(e.target.value)
              )
            }
            className="w-full rounded-lg border p-3"
          />

        </div>

      ) : (

        <div className="rounded-xl border bg-slate-50 p-5">

          <p className="font-medium">

            Este recurso admite una sola reserva por horario.

          </p>

        </div>

      )}

      <div className="flex gap-4">

        <Button
          onClick={onBack}
          className="w-full rounded-lg border py-3"
        >
          Atrás
        </Button>

        <Button
          disabled={loading}
          onClick={onSubmit}
          className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-white disabled:opacity-50"
        >
          {loading
          ? mode === "create"
            ? "Creando..."
            : "Guardando..."
          : mode === "create"
            ? "Crear recurso"
            : "Guardar cambios"}
        </Button>

      </div>

    </div>
  );
}