import Button from "@/components/ui/Button/index";
import type { ResourceType } from "../../types/resource.types";

interface Props {
  type: ResourceType;

  capacity: number;

  price: number;

  depositAmount: number;

  loading: boolean;

  reservationDuration: number;

  mode: "create" | "edit";

  onCapacityChange(value: number): void;

  onPriceChange(value: number): void;

  onDepositAmountChange(value: number): void;

  onReservationDurationChange(value: number): void;

  onBack(): void;

  onSubmit(): void;
}

export default function StepCapacity({
  type,
  capacity,
  price,
  depositAmount,
  loading,
  reservationDuration,
  mode,
  onCapacityChange,
  onPriceChange,
  onDepositAmountChange,
  onReservationDurationChange,
  onBack,
  onSubmit,
}: Props) {
  const isGym = type === "gym";

  const depositExceedsPrice = depositAmount > price;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Configuración</h1>

        <p className="mt-2 text-[var(--color-muted)]">
          {mode === "create"
            ? "Último paso para crear el recurso."
            : "Último paso para guardar los cambios."}
        </p>
      </div>

      {/* CAPACIDAD */}
      {isGym ? (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-medium">
              Cantidad máxima de personas por turno
            </label>

            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => onCapacityChange(Number(e.target.value))}
              className="w-full rounded-lg border p-3"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium">
              Duración de la clase
            </label>

            <select
              value={reservationDuration}
              onChange={(e) =>
                onReservationDurationChange(Number(e.target.value))
              }
              className="w-full rounded-lg border p-3"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
              <option value={120}>120 minutos</option>
            </select>

            <p className="mt-2 text-sm text-gray-500">
              Esta duración se utilizará para generar los horarios disponibles y las reservas del gimnasio.
            </p>
          </div>
        </div>
        
      ) : (
        <div className="rounded-xl border p-5">
          <p className="font-medium">
            Este recurso admite una sola reserva por horario.
          </p>
        </div>
      )}

      {/* PRECIO */}
      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-medium">Precio por reserva</label>

          <input
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full rounded-lg border p-3"
            placeholder="20000"
          />

          <p className="mt-1 text-sm text-slate-500">
            Es el precio total que deberá pagar el cliente por la reserva.
          </p>
        </div>

        {/* SEÑA */}
        <div>
          <label className="mb-2 block font-medium">Seña para reservar</label>

          <input
            type="number"
            min={0}
            step={100}
            value={depositAmount}
            onChange={(e) => onDepositAmountChange(Number(e.target.value))}
            className="w-full rounded-lg border p-3"
            placeholder="5000"
          />

          <p className="mt-1 text-sm text-slate-500">
            Este será el importe que el cliente pagará mediante Mercado Pago
            para confirmar la reserva.
          </p>

          {depositExceedsPrice && (
            <p className="mt-2 text-sm font-medium text-red-600">
              La seña no puede ser mayor que el precio total.
            </p>
          )}
        </div>

        {/* RESUMEN */}
        <div className="rounded-xl border p-5">
          <h3 className="mb-3 font-semibold">Valores de la reserva</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Precio total de la cancha</span>

              <span className="font-semibold">
                ${price.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Valor para reservar</span>

              <span className="font-semibold">
                ${depositAmount.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-4">
        <Button onClick={onBack} className="w-full rounded-lg border py-3">
          Atrás
        </Button>

        <Button
          disabled={
            loading || price < 0 || depositAmount < 0 || depositExceedsPrice
          }
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
