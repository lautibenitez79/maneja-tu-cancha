import { useState } from "react";

import Input from "@/components/ui/Input/index";
import Button from "@/components/ui/Button/index";

interface Props {
  onSubmit(values: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  }): void;

  loading?: boolean;
}

export default function PublicReservationForm({
  onSubmit,
  loading = false,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!customerName.trim()) {
      return;
    }

    if (!customerPhone.trim()) {
      return;
    }

    if (!customerEmail.trim()) {
      return;
    }

    onSubmit({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-title)]">
          Nombre completo
        </span>

        <Input
          value={customerName}
          onChange={(event) =>
            setCustomerName(event.target.value)
          }
          placeholder="Tu nombre"
          disabled={loading}
          required
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-title)]">
          Teléfono
        </span>

        <Input
          value={customerPhone}
          onChange={(event) =>
            setCustomerPhone(event.target.value)
          }
          placeholder="11 1234-5678"
          type="tel"
          disabled={loading}
          required
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-title)]">
          Email
        </span>

        <Input
          value={customerEmail}
          onChange={(event) =>
            setCustomerEmail(event.target.value)
          }
          placeholder="tu@email.com"
          type="email"
          disabled={loading}
          required
        />
      </label>

      <Button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Confirmando..."
          : "Confirmar reserva"}
      </Button>
    </form>
  );
}