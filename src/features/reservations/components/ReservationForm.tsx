import Input from "@/components/ui/Input/index";
import Button from "@/components/ui/Button/index";

import { useState } from "react";

import type {
  CreateReservationForm,
} from "../types/reservation.types";

interface Props {

  resourceId: string;

  startsAt: string;

  endsAt: string;

  onSubmit(
    values: CreateReservationForm,
  ): void;

}

export default function ReservationForm({

    resourceId,

    startsAt,

    endsAt,

    onSubmit,

}: Props) {

  const [customerName, setCustomerName] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [customerEmail, setCustomerEmail] = useState("");

  return (

    <form
      className="space-y-4"
      onSubmit={(e) => {

        e.preventDefault();

        onSubmit({

          resource_id: resourceId,

          customer_name: customerName,

          customer_phone: customerPhone,

          customer_email: customerEmail,

          starts_at: startsAt,

          ends_at: endsAt,

          amount_paid: 0,

          source: "admin",

          notes: "",

        });

      }}
    >

        <label className="block space-y-1">
            <span className="text-sm font-medium">
                Nombre completo
            </span>

            <Input
                value={customerName}
                onChange={(e) =>
                setCustomerName(e.target.value)
                }
            />
        </label>

        <label className="block space-y-1">
            <span className="text-sm font-medium">
                Telefono
            </span>

            <Input
                value={customerPhone}
                onChange={(e) =>
                setCustomerPhone(e.target.value)
                }
            />
        </label>

        <label className="block space-y-1">
            <span className="text-sm font-medium">
                Email
            </span>

            <Input
                value={customerEmail}
                onChange={(e) =>
                setCustomerEmail(e.target.value)
                }
            />
        </label>

      <Button type="submit">

        Reservar

      </Button>

    </form>

  );

}