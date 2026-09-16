import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type {
  BalancePaymentMethod,
} from "../types/reservation.types";

import type {
  ReservationTracking,
} from "../types/reservation-tracking.types";

interface ReservationPaymentCellProps {
  reservation: ReservationTracking;
  saving: boolean;
  onSave: (
    amount: number,
    method: BalancePaymentMethod | null,
  ) => Promise<void>;
}

export function ReservationPaymentCell({
  reservation,
  saving,
  onSave,
}: ReservationPaymentCellProps) {
  const disabled =
    reservation.attendance_status ===
    "no_show";

  const [amount, setAmount] = useState(
    String(
      reservation.balance_paid_amount ?? 0,
    ),
  );

  const [method, setMethod] =
    useState<BalancePaymentMethod | "">(
      reservation.balance_payment_method ?? "",
    );

  useEffect(() => {
    setAmount(
      String(
        reservation.balance_paid_amount ?? 0,
      ),
    );

    setMethod(
      reservation.balance_payment_method ?? "",
    );
  }, [
    reservation.balance_paid_amount,
    reservation.balance_payment_method,
  ]);

  const total = Number(
    reservation.total_amount ?? 0,
  );

  const deposit = Number(
    reservation.amount_paid ?? 0,
  );

  const balancePaid = Number(
    reservation.balance_paid_amount ?? 0,
  );

  const pending = Math.max(
    0,
    total - deposit - balancePaid,
  );

  async function handleSave() {
    const numericAmount =
      Number(amount) || 0;

    await onSave(
      numericAmount,
      method || null,
    );
  }

  return (
    <div className="min-w-[220px] space-y-2">
      <div className="text-xs text-muted-foreground">
        Pendiente:{" "}
        <span className="font-semibold text-foreground">
          ${pending.toLocaleString("es-AR")}
        </span>
      </div>

      <input
        type="number"
        min="0"
        value={amount}
        disabled={disabled || saving}
        onChange={(event) =>
          setAmount(event.target.value)
        }
        className="h-9 w-full rounded-lg border bg-transparent px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Saldo abonado"
      />

      <select
        value={method}
        disabled={disabled || saving}
        onChange={(event) =>
          setMethod(
            event.target.value as
              | BalancePaymentMethod
              | "",
          )
        }
        className="h-9 w-full rounded-lg border bg-transparent px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">
          Método de pago
        </option>
        <option value="cash">
          Efectivo
        </option>
        <option value="mercado_pago">
          Mercado Pago
        </option>
        <option value="transfer">
          Transferencia
        </option>
      </select>

      <button
        type="button"
        disabled={
          disabled ||
          saving ||
          Number(amount) < 0
        }
        onClick={() =>
          void handleSave()
        }
        className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving && (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        )}

        Guardar pago
      </button>
    </div>
  );
}