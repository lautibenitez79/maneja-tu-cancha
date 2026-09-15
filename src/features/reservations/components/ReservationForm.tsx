import Input from "@/components/ui/Input/index";
import Button from "@/components/ui/Button/index";

import { useEffect, useState } from "react";
import { addMonths, format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import type {
  CreateReservationForm,
} from "../types/reservation.types";

interface Props {
  resourceId: string;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  onSubmit(
    values: CreateReservationForm,
  ): void | Promise<void>;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function ReservationForm({
  resourceId,
  startsAt,
  endsAt,
  timezone = "America/Argentina/Buenos_Aires",
  onSubmit,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [reservationType, setReservationType] = useState<
    "daily" | "recurring"
  >("daily");

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");

  const localStartDate = formatInTimeZone(
    startsAt,
    timezone,
    "yyyy-MM-dd",
  );

  const localDayOfWeek = Number(
    formatInTimeZone(startsAt, timezone, "i"),
  );

  const jsDayOfWeek = localDayOfWeek === 7 ? 0 : localDayOfWeek;

  useEffect(() => {
    setStartsOn(localStartDate);
    setEndsOn(
      format(
        addMonths(parseISO(localStartDate), 1),
        "yyyy-MM-dd",
      ),
    );

    setDaysOfWeek([jsDayOfWeek]);
  }, [startsAt, timezone]);

  function toggleDay(day: number) {
    setDaysOfWeek((current) => {
      if (current.includes(day)) {
        return current.filter((value) => value !== day);
      }

      return [...current, day];
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        const values: CreateReservationForm = {
          resource_id: resourceId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          starts_at: startsAt,
          ends_at: endsAt,
          amount_paid: 0,
          source: "admin",
          notes: "",
        };

        if (reservationType === "recurring") {
          if (daysOfWeek.length === 0) {
            return;
          }

          values.recurring = {
            days_of_week: daysOfWeek,
            starts_on: startsOn,
            ends_on: endsOn,
          };
        }

        onSubmit(values);
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
          type="email"
          value={customerEmail}
          onChange={(e) =>
            setCustomerEmail(e.target.value)
          }
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium">
          Tipo de reserva
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setReservationType("daily")
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              reservationType === "daily"
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "hover:bg-slate-50"
            }`}
          >
            Por día
          </button>

          <button
            type="button"
            onClick={() =>
              setReservationType("recurring")
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              reservationType === "recurring"
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "hover:bg-slate-50"
            }`}
          >
            Recurrente
          </button>
        </div>
      </div>

      {reservationType === "recurring" && (
        <div className="space-y-4 rounded-xl border bg-slate-50 p-4">
          <div>
            <p className="mb-2 text-sm font-medium">
              Días de la semana
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DAYS_OF_WEEK.map((day) => {
                const selected =
                  daysOfWeek.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      toggleDay(day.value)
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "bg-white hover:bg-slate-100"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">
                Desde
              </span>

              <input
                type="date"
                value={startsOn}
                onChange={(e) =>
                  setStartsOn(e.target.value)
                }
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">
                Hasta
              </span>

              <input
                type="date"
                value={endsOn}
                onChange={(e) =>
                  setEndsOn(e.target.value)
                }
                className="w-full rounded-lg border bg-white px-3 py-2"
              />
            </label>
          </div>

          <p className="text-xs text-slate-500">
            La reserva recurrente se genera por 1 mes
            calendario.
          </p>
        </div>
      )}

      <Button type="submit">
        Reservar
      </Button>
    </form>
  );
}