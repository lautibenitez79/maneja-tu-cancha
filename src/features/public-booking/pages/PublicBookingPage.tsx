import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { format, addDays, startOfToday } from "date-fns";

import { es } from "date-fns/locale";

import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

import { publicBookingService } from "../services/public-booking.service";

import type { Club } from "@/features/clubs/types/club.types";
import type { Resource } from "@/features/resources/types/resource.types";
import PublicReservationForm from "@/features/reservations/components/PublicReservationForm";
import type { PublicAvailableSlot } from "../types/public-booking.types";


function formatClubTime(
  value: string,
  timezone?: string | null,
) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone:
      timezone ||
      "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}


export default function PublicBookingPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [club, setClub] = useState<Club | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());

  const [slots, setSlots] = useState<PublicAvailableSlot[]>([]);

  const [selectedSlot, setSelectedSlot] = useState<PublicAvailableSlot | null>(
    null,
  );

  const [creatingReservation, setCreatingReservation] = useState(false);

  const [reservationCreated, setReservationCreated] = useState(false);

  const [reservationError, setReservationError] = useState("");

  const [loading, setLoading] = useState(true);

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!slug) {
        setError("No se encontró el complejo.");

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const clubData = await publicBookingService.getClubBySlug(slug);

        if (!clubData) {
          setError("El complejo no existe o no está disponible.");

          return;
        }

        const resourceData = await publicBookingService.getResources(
          clubData.id,
        );

        setClub(clubData);
        setResources(resourceData);
      } catch (error) {
        console.error(error);

        setError("No se pudo cargar el complejo.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedResource) {
        setSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);

        const date = format(selectedDate, "yyyy-MM-dd");

        const data = await publicBookingService.getAvailableSlots(
          selectedResource.id,
          date,
        );

        setSlots(data);
      } catch (error) {
        console.error(error);

        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedResource, selectedDate]);

  async function handleCreateReservation(values: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  }) {
    if (!club || !selectedResource || !selectedSlot) {
      return;
    }

    try {
      setCreatingReservation(true);
      setReservationError("");

      await publicBookingService.createReservation({
        clubId: club.id,
        resourceId: selectedResource.id,

        customerName: values.customer_name,
        customerPhone: values.customer_phone,
        customerEmail: values.customer_email,

        startsAt: selectedSlot.starts_at,
        endsAt: selectedSlot.ends_at,
      });

      setReservationCreated(true);
    } catch (error) {
      console.error(error);

      setReservationError(
        "No se pudo realizar la reserva. El horario puede haber sido ocupado. Actualizá los horarios e intentá nuevamente.",
      );
    } finally {
      setCreatingReservation(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-10">
        <div className="mx-auto max-w-md">
          <EmptyState title="No disponible" description={error} />
        </div>
      </div>
    );
  }

  if (!club) {
    return null;
  }

  const dates = Array.from({ length: 7 }, (_, index) =>
    addDays(startOfToday(), index),
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* ENCABEZADO */}

        <header className="mb-8 text-center sm:mb-10">
          {club.logo_url && (
            <img
              src={club.logo_url}
              alt={club.name}
              className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover"
            />
          )}

          <h1 className="text-3xl font-bold text-[var(--color-title)] sm:text-4xl">
            {club.name}
          </h1>

          {club.description && (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--color-text)] sm:text-base">
              {club.description}
            </p>
          )}

          {(club.city || club.province) && (
            <p className="mt-2 text-sm text-slate-500">
              {[club.city, club.province].filter(Boolean).join(", ")}
            </p>
          )}
        </header>

        {/* CANCHAS */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[var(--color-title)] sm:text-2xl">
              Elegí dónde querés jugar
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Seleccioná una cancha para ver los horarios disponibles.
            </p>
          </div>

          {resources.length === 0 ? (
            <EmptyState
              title="No hay canchas disponibles"
              description="Este complejo todavía no tiene recursos habilitados para reservas."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => {
                const selected = selectedResource?.id === resource.id;

                return (
                  <button
                    key={resource.id}
                    type="button"
                    onClick={() => {
                      setSelectedResource(resource);
                      setSelectedSlot(null);
                      setReservationCreated(false);
                      setReservationError("");
                    }}
                    className={`group rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "bg-[var(--color-card)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-title)]">
                          {resource.name}
                        </h3>

                        <p className="mt-1 text-sm capitalize text-slate-500">
                          {resource.type}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        Reservar
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                      <span>
                        {resource.reservation_duration === 90
                          ? "1:30 hs"
                          : `${resource.reservation_duration / 60} hs`}
                      </span>

                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* FECHA */}

        {selectedResource && (
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-[var(--color-title)]">
                Elegí el día
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Seleccioná la fecha en la que querés jugar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {dates.map((date) => {
                const selected =
                  format(date, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd");

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                      setReservationCreated(false);
                      setReservationError("");
                    }}
                    className={`rounded-xl border px-3 py-4 text-center transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "bg-[var(--color-card)] hover:bg-blue-50"
                    }`}
                  >
                    <span className="block text-xs uppercase">
                      {format(date, "EEE", {
                        locale: es,
                      })}
                    </span>

                    <span className="mt-1 block text-lg font-bold">
                      {format(date, "dd")}
                    </span>

                    <span className="block text-xs">
                      {format(date, "MMM", {
                        locale: es,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* HORARIOS */}

        {selectedResource && (
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-[var(--color-title)]">
                Horarios disponibles
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedResource.name}
              </p>
            </div>

            {loadingSlots ? (
              <div className="rounded-2xl border bg-[var(--color-card)] p-8 text-center">
                <p className="text-sm text-slate-500">Buscando horarios...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-2xl border bg-[var(--color-card)] p-8 text-center">
                <p className="font-medium text-[var(--color-title)]">
                  No hay horarios disponibles
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Probá seleccionando otro día.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                  const starts = formatClubTime(
                    slot.starts_at,
                    club.timezone,
                  );

                  const ends = formatClubTime(
                    slot.ends_at,
                    club.timezone,
                  );

                  return (
                    <button
                      key={slot.starts_at}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setReservationCreated(false);
                        setReservationError("");
                      }}
                      className={`rounded-xl border px-4 py-4 text-left shadow-sm transition ${
                        selectedSlot?.starts_at === slot.starts_at
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "bg-[var(--color-card)] hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <span className="block text-base font-semibold text-[var(--color-title)]">
                        {starts} → {ends}
                      </span>

                      <span
                        className={`mt-1 block text-xs ${
                          selectedSlot?.starts_at === slot.starts_at
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        Disponible
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {selectedResource && selectedSlot && !reservationCreated && (
          <section className="mt-10">
            <div className="mx-auto max-w-xl rounded-2xl border bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-title)]">
                  Confirmá tu reserva
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Completá tus datos para registrar la reserva.
                </p>
              </div>

              <div className="mb-6 rounded-xl bg-[var(--color-card)] border p-4">
                <p className="text-sm text-slate-500">Reserva</p>

                <p className="mt-1 font-semibold text-[var(--color-title)]">
                  {selectedResource.name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {format(selectedDate, "EEEE dd 'de' MMMM", {
                    locale: es,
                  })}
                </p>

                <p className="mt-1 text-sm font-medium text-blue-600">
                  {formatClubTime(
                    selectedSlot.starts_at,
                    club.timezone,
                  )}{" "}
                  →{" "}
                  {formatClubTime(
                    selectedSlot.ends_at,
                    club.timezone,
                  )}
                </p>
              </div>

              {reservationError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {reservationError}
                </div>
              )}

              <PublicReservationForm
                onSubmit={handleCreateReservation}
                loading={creatingReservation}
              />
            </div>
          </section>
        )}
        {reservationCreated && selectedResource && selectedSlot && (
          <section className="mt-10">
            <div className="mx-auto max-w-xl rounded-2xl border bg-[var(--color-card)] p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                ✓
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[var(--color-title)]">
                ¡Reserva realizada!
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Tu solicitud de reserva fue registrada correctamente.
              </p>

              <div className="mt-6 rounded-xl bg-[var(--color-card)] border p-4 text-left">
                <p className="font-semibold text-[var(--color-title)]">
                  {selectedResource.name}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {format(selectedDate, "EEEE dd 'de' MMMM", {
                    locale: es,
                  })}
                </p>

                <p className="mt-1 text-sm font-medium text-blue-600">
                  {formatClubTime(
                    selectedSlot.starts_at,
                    club.timezone,
                  )}{" "}
                  →{" "}
                  {formatClubTime(
                    selectedSlot.ends_at,
                    club.timezone,
                  )}
                </p>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                El complejo recibió tu solicitud de reserva.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
