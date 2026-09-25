import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  clubService,
  type ClubServiceKey,
} from "../services/club.service";

const SERVICE_OPTIONS: {
  value: ClubServiceKey;
  label: string;
}[] = [
  {
    value: "wifi",
    label: "Wi-Fi",
  },
  {
    value: "locker_room",
    label: "Vestuario",
  },
  {
    value: "parking",
    label: "Estacionamiento",
  },
  {
    value: "medical_aid",
    label: "Ayuda médica",
  },
  {
    value: "tournaments",
    label: "Torneos",
  },
  {
    value: "birthdays",
    label: "Cumpleaños",
  },
  {
    value: "grill",
    label: "Parrilla",
  },
  {
    value: "sports_school",
    label: "Escuelita deportiva",
  },
  {
    value: "schools",
    label: "Colegios",
  },
  {
    value: "bar_restaurant",
    label: "Bar / Restaurante",
  },
  {
    value: "quincho",
    label: "Quincho",
  },
  {
    value: "beelup",
    label: "Beelup",
  },
];

export default function CreateClubWizard() {
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState("");

  const [selectedServices, setSelectedServices] =
    useState<ClubServiceKey[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  function handleNext() {
    if (!name.trim()) {
      setError("Ingresá el nombre del complejo.");
      return;
    }

    setError("");
    setStep(2);
  }

  function handleBack() {
    setError("");
    setStep(1);
  }

  function toggleService(service: ClubServiceKey) {
    setSelectedServices((current) => {
      if (current.includes(service)) {
        return current.filter(
          (item) => item !== service,
        );
      }

      return [...current, service];
    });
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (loading) return;
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const club = await clubService.createFirstClub({
        name: name.trim(),
        phone: "",
        email: user.email ?? "",
        address: "",
        city: "",
        province: "",
        country: "Argentina",
        timezone:
          "America/Argentina/Buenos_Aires",
        currency: "ARS",
      });

      await clubService.setServices(
        club.id,
        selectedServices,
      );

      await refreshProfile();
    } catch (err) {
      console.error(err);

      setError(
        "No se pudo crear el complejo. Intentá nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-20 w-full max-w-2xl px-4">
      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold">
            Bienvenido 👋
          </h1>

          <p className="mt-2 text-[var(--color-muted)]">
            Antes de comenzar, creemos tu primer
            complejo.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="mt-8 space-y-4"
          >
            <div>
              <label className="mb-2 block font-medium">
                Nombre del complejo
              </label>

              <input
                className="w-full rounded border p-3"
                placeholder="Ej. Juventud"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-[var(--color-primary)] p-3 text-white"
            >
              Continuar
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-semibold">
            Servicios del complejo
          </h1>

          <p className="mt-2 text-[var(--color-muted)]">
            Seleccioná los servicios que ofrece tu
            complejo.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SERVICE_OPTIONS.map((service) => {
                const selected =
                  selectedServices.includes(
                    service.value,
                  );

                return (
                  <button
                    key={service.value}
                    type="button"
                    onClick={() =>
                      toggleService(service.value)
                    }
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="font-medium">
                      {service.label}
                    </span>

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                        selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="w-full rounded border p-3 disabled:opacity-50"
              >
                Atrás
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-[var(--color-primary)] p-3 text-white disabled:opacity-50"
              >
                {loading
                  ? "Creando..."
                  : "Crear complejo"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}