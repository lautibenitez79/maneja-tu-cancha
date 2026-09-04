import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { format, addDays, startOfToday, addMonths, subDays } from "date-fns";

import { es } from "date-fns/locale";

import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

import { mercadoPagoService } from "../services/mercadopago.service";

import type { Club } from "@/features/clubs/types/club.types";
import type { Resource } from "@/features/resources/types/resource.types";
import PublicReservationForm from "@/features/reservations/components/PublicReservationForm";
import type { PublicAvailableSlot } from "../types/public-booking.types";

import { publicBookingService } from "../services/public-booking.service";
import type { PublicWorkingHour } from "../services/public-booking.service";

function formatClubTime(value: string, timezone?: string | null) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: timezone || "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default function PublicBookingPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const navigate = useNavigate();

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

  const [workingHours, setWorkingHours] = useState<PublicWorkingHour[]>([]);

  const [gymVisitsPerWeek, setGymVisitsPerWeek] = useState<number>(1);

  const [gymVisitDays, setGymVisitDays] = useState<number[]>([]);

  const [gymStartTime, setGymStartTime] = useState("");

  const [gymEndTime, setGymEndTime] = useState("");

  const [gymTotalVisits, setGymTotalVisits] = useState(0);

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

  useEffect(() => {
    async function loadWorkingHours() {
      if (!selectedResource) {
        setWorkingHours([]);
        setGymVisitDays([]);
        setGymStartTime("");
        setGymEndTime("");
        return;
      }

      try {
        const data = await publicBookingService.getWorkingHours(
          selectedResource.id,
        );

        setWorkingHours(data);

        const enabledDays = data
          .filter((day) => day.enabled)
          .map((day) => day.day_of_week);

        setGymVisitDays((current) =>
          current.filter((day) => enabledDays.includes(day)),
        );
      } catch (error) {
        console.error(error);
        setWorkingHours([]);
      }
    }

    loadWorkingHours();
  }, [selectedResource]);

  const isGym = selectedResource?.type === "gym";

  const gymEnabledDays = workingHours.filter((day) => day.enabled);

  const selectedGymWorkingHours = workingHours.filter(
    (day) => day.enabled && gymVisitDays.includes(day.day_of_week),
  );

  function toggleGymVisitDay(dayOfWeek: number) {
    setGymVisitDays((current) => {
      if (current.includes(dayOfWeek)) {
        return current.filter((day) => day !== dayOfWeek);
      }

      if (current.length >= gymVisitsPerWeek) {
        return current;
      }

      return [...current, dayOfWeek].sort((a, b) => a - b);
    });
  }

  function calculateGymTotalVisits(
    startsOn: Date,
    endsOn: Date,
    visitDays: number[],
  ) {
    let total = 0;

    let current = new Date(startsOn);

    while (current <= endsOn) {
      if (visitDays.includes(current.getDay())) {
        total++;
      }

      current = addDays(current, 1);
    }

    return total;
  }

  useEffect(() => {
    if (!isGym) {
      return;
    }

    setGymVisitDays((current) => current.slice(0, gymVisitsPerWeek));
  }, [gymVisitsPerWeek, isGym]);

  async function handleCreateGymMonthlyFee(values: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  }) {
    if (!club || !selectedResource || !isGym) {
      return;
    }

    if (gymVisitDays.length !== gymVisitsPerWeek) {
      setReservationError(
        `Seleccioná exactamente ${gymVisitsPerWeek} ${
          gymVisitsPerWeek === 1 ? "día" : "días"
        }.`,
      );

      return;
    }

    if (!gymStartTime || !gymEndTime) {
      setReservationError("Seleccioná un horario.");

      return;
    }

    if (gymTotalVisits <= 0) {
      setReservationError("No se pudieron calcular las visitas del mes.");

      return;
    }

    const startsOn = startOfToday();

    const endsOn = subDays(addMonths(startsOn, 1), 1);

    try {
      setCreatingReservation(true);
      setReservationError("");

      const fee = await publicBookingService.createGymMonthlyFee({
        clubId: club.id,

        resourceId: selectedResource.id,

        customerName: values.customer_name,

        customerPhone: values.customer_phone,

        customerEmail: values.customer_email,

        startsOn: format(startsOn, "yyyy-MM-dd"),

        endsOn: format(endsOn, "yyyy-MM-dd"),

        visitsPerWeek: gymVisitsPerWeek,

        totalVisits: gymTotalVisits,

        visitDays: gymVisitDays,

        startTime: `${gymStartTime}:00`,

        endTime: `${gymEndTime}:00`,

        totalAmount: Number(selectedResource.price ?? 0),
      });

      console.log("Cuota mensual creada:", fee);

      const feeId = typeof fee === "string" ? fee : fee?.id;

      if (!feeId) {
        throw new Error("No se pudo obtener el ID de la cuota.");
      }

      const preference = await mercadoPagoService.createPreference({
        clubId: club.id,
        gymMonthlyFeeId: feeId,
      });

      if (!preference.init_point) {
        throw new Error("Mercado Pago no devolvió init_point.");
      }

      sessionStorage.setItem(`gym_payment_url_${feeId}`, preference.init_point);

      window.location.href = preference.init_point;
    } catch (error) {
      console.error("Error creando cuota/pago:", error);

      setReservationError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuota mensual.",
      );
    } finally {
      setCreatingReservation(false);
    }
  }

  async function handleCreateReservation(values: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  }) {
    if (!club || !selectedResource || !selectedSlot) {
      return;
    }

    // Abrimos la pestaña inmediatamente como consecuencia
    // directa del click del usuario.

    const paymentWindow = window.open("", "_blank");

    if (!paymentWindow) {
      setReservationError(
        "No pudimos abrir la ventana de pago. Permití las ventanas emergentes de este sitio e intentá nuevamente.",
      );

      return;
    }

    try {
      setCreatingReservation(true);
      setReservationError("");

      /*
       * ---------------------------------------------------------
       * 1. Crear la reserva
       * ---------------------------------------------------------
       */

      const reservation = await publicBookingService.createReservation({
        resourceId: selectedResource.id,
        customerName: values.customer_name,
        customerPhone: values.customer_phone,
        customerEmail: values.customer_email,
        startsAt: selectedSlot.starts_at,
        endsAt: selectedSlot.ends_at,
      });

      /*
       * ---------------------------------------------------------
       * 2. Crear Preference de Mercado Pago
       * ---------------------------------------------------------
       */

      const preference = await mercadoPagoService.createPreference({
        clubId: club.id,
        reservationId: reservation.id,
      });

      /*
       * ---------------------------------------------------------
       * 3. Enviar email de reserva
       * ---------------------------------------------------------
       *
       * El email se intenta enviar después de crear
       * el pago porque necesitamos el init_point
       * para incluir el botón "Pagar seña".
       *
       * Si el email falla, NO rompemos la reserva.
       */

      if (preference.init_point) {
        try {
          const emailResponse = await fetch("/api/notifications/send-email", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              to: values.customer_email,

              template: "reservationCreated",

              data: {
                customerName: values.customer_name,

                clubName: club.name,

                resourceName: selectedResource.name,

                date: format(selectedDate, "EEEE dd 'de' MMMM", {
                  locale: es,
                }),

                startTime: formatClubTime(
                  selectedSlot.starts_at,
                  club.timezone,
                ),

                endTime: formatClubTime(selectedSlot.ends_at, club.timezone),

                amount: selectedResource.price,

                depositAmount: selectedResource.deposit_amount,

                paymentUrl: preference.init_point,
              },
            }),
          });

          if (!emailResponse.ok) {
            const emailError = await emailResponse.text();

            console.error("No se pudo enviar el email de reserva:", emailError);
          }
        } catch (emailError) {
          console.error("Error enviando email de reserva:", emailError);
        }
      }

      /*
       * ---------------------------------------------------------
       * 4. Validar init_point
       * ---------------------------------------------------------
       */

      if (!preference.init_point) {
        throw new Error("Mercado Pago no devolvió init_point.");
      }

      /* guardamos el link de la reserva */

      sessionStorage.setItem(
        `payment_url_${reservation.id}`,
        preference.init_point,
      );

      /*
       * 4. Mandar Mercado Pago a la nueva pestaña
       */
      paymentWindow.location.href = preference.init_point;

      /*
       * 5. Mantener esta pestaña en Maneja Tu Cancha
       */
      navigate(
        `/pago/pendiente?reservation_id=${encodeURIComponent(reservation.id)}`,
      );
    } catch (error) {
      console.error("Error creando reserva/pago:", error);

      // Si algo falla antes de abrir Mercado Pago,
      // cerramos la pestaña que habíamos reservado.
      paymentWindow.close();

      setReservationError(
        error instanceof Error
          ? error.message
          : "No se pudo realizar la reserva. Intentá nuevamente.",
      );
    } finally {
      setCreatingReservation(false);
    }
  }

  function timeToMinutes(value: string) {
    const [hours, minutes] = value.slice(0, 5).split(":").map(Number);

    return hours * 60 + minutes;
  }

  function minutesToTime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  function getGymTimeOptionsForSelectedDays() {
    if (
      selectedGymWorkingHours.length === 0 ||
      gymVisitDays.length !== gymVisitsPerWeek
    ) {
      return [];
    }

    const duration = selectedResource?.reservation_duration ?? 60;

    const availableByDay = selectedGymWorkingHours.map((day) => {
      const ranges: Array<[number, number]> = [];

      function addRange(startValue: string | null, endValue: string | null) {
        if (!startValue || !endValue) {
          return;
        }

        const open = timeToMinutes(startValue);

        let close = timeToMinutes(endValue);

        if (close === 0 && open > 0) {
          close = 1440;
        }

        if (open === 0 && close === 0) {
          close = 1440;
        }

        if (close > open) {
          ranges.push([open, close]);
        }
      }

      // Primer bloque: 09:00 → 13:00
      addRange(day.opens_at, day.closes_at);

      // Segundo bloque: 16:00 → 21:00
      addRange(day.reopens_at, day.final_closes_at);

      const result = new Set<string>();

      for (const [open, close] of ranges) {
        for (
          let minutes = open;
          minutes + duration <= close;
          minutes += duration
        ) {
          result.add(minutesToTime(minutes));
        }
      }

      return result;
    });

    if (availableByDay.length === 0) {
      return [];
    }

    // Solo mostramos horarios que existen en TODOS los días seleccionados.
    return Array.from(availableByDay[0]).filter((time) =>
      availableByDay.every((times) => times.has(time)),
    );
  }

  useEffect(() => {
    if (!isGym || gymVisitDays.length !== gymVisitsPerWeek) {
      setGymTotalVisits(0);
      return;
    }

    const startsOn = startOfToday();

    const endsOn = subDays(addMonths(startsOn, 1), 1);

    const total = calculateGymTotalVisits(startsOn, endsOn, gymVisitDays);

    setGymTotalVisits(total);
  }, [isGym, gymVisitDays, gymVisitsPerWeek]);

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

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Precio total</span>

                        <span className="font-semibold text-[var(--color-title)]">
                          ${resource.price.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Para reservar</span>

                        <span className="font-semibold text-blue-600">
                          ${resource.deposit_amount.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-3 text-sm text-slate-500">
                        <span>Duración</span>

                        <span>
                          {resource.reservation_duration === 90
                            ? "1:30 hs"
                            : `${resource.reservation_duration / 60} hs`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {isGym ? (
          <div className="mt-10 space-y-6">
            {/* FRECUENCIA */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-title)]">
                Frecuencia de visitas
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Elegí cuántos días por semana querés asistir.
              </p>

              <select
                value={gymVisitsPerWeek}
                onChange={(e) => {
                  setGymVisitsPerWeek(Number(e.target.value));
                  setGymStartTime("");
                  setGymEndTime("");
                  setReservationError("");
                }}
                className="mt-3 w-full rounded-xl border p-3"
              >
                {gymEnabledDays.map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1} {index === 0 ? "día" : "días"} por semana
                  </option>
                ))}
              </select>
            </div>

            {/* DÍAS */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-title)]">
                Días de asistencia
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gymEnabledDays.map((day) => {
                  const selected = gymVisitDays.includes(day.day_of_week);

                  const labels = [
                    "Domingo",
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                  ];

                  return (
                    <button
                      key={day.day_of_week}
                      type="button"
                      onClick={() => {
                        toggleGymVisitDay(day.day_of_week);
                        setGymStartTime("");
                        setGymEndTime("");
                        setReservationError("");
                      }}
                      className={`rounded-xl border p-3 text-sm font-medium transition ${
                        selected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      {labels[day.day_of_week]}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Seleccioná exactamente {gymVisitsPerWeek}{" "}
                {gymVisitsPerWeek === 1 ? "día" : "días"}.
              </p>
            </div>

            {/* HORARIO */}
            {gymVisitDays.length === gymVisitsPerWeek && (
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-title)]">
                  Horario
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  El horario debe estar disponible en todos los días
                  seleccionados.
                </p>

                <select
                  value={gymStartTime}
                  onChange={(e) => {
                    const value = e.target.value;

                    setGymStartTime(value);

                    const duration =
                      selectedResource?.reservation_duration ?? 60;

                    const start = timeToMinutes(value);

                    setGymEndTime(minutesToTime(start + duration));
                    setReservationError("");
                  }}
                  className="mt-3 w-full rounded-xl border p-3"
                >
                  <option value="">Seleccioná un horario</option>

                  {getGymTimeOptionsForSelectedDays().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* RESUMEN DE CUOTA */}
            {gymTotalVisits > 0 && gymStartTime && (
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitas del mes</span>

                  <strong>{gymTotalVisits}</strong>
                </div>

                <div className="mt-2 flex justify-between">
                  <span className="text-gray-600">Total de la cuota</span>

                  <strong>
                    $
                    {Number(selectedResource?.price ?? 0).toLocaleString(
                      "es-AR",
                    )}
                  </strong>
                </div>

                <div className="mt-2 flex justify-between">
                  <span className="text-gray-600">Horario</span>

                  <strong>
                    {gymStartTime} → {gymEndTime}
                  </strong>
                </div>
              </div>
            )}

            {/* DATOS DEL CLIENTE */}
            {gymTotalVisits > 0 &&
              gymStartTime &&
              gymEndTime &&
              !reservationCreated && (
                <section>
                  <div className="mx-auto max-w-xl rounded-2xl border bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-[var(--color-title)]">
                        Registrá tus datos
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Completá tus datos para continuar con el pago de la
                        cuota.
                      </p>
                    </div>

                    {reservationError && (
                      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {reservationError}
                      </div>
                    )}

                    <PublicReservationForm
                      onSubmit={handleCreateGymMonthlyFee}
                      loading={creatingReservation}
                    />
                  </div>
                </section>
              )}
          </div>
        ) : (
          <>
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
                    <p className="text-sm text-slate-500">
                      Buscando horarios...
                    </p>
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

                      const ends = formatClubTime(slot.ends_at, club.timezone);

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

            {/* DATOS DEL CLIENTE - RESERVA NORMAL */}
            {selectedResource && selectedSlot && !reservationCreated && (
              <section className="mt-10">
                <div className="mx-auto max-w-xl rounded-2xl border bg-[var(--color-card)] p-5 shadow-sm sm:p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-[var(--color-title)]">
                      Reservá tu cancha
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completá tus datos para continuar con la reserva.
                    </p>
                  </div>

                  <div className="mb-6 rounded-xl border bg-[var(--color-card)] p-4">
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
                      {formatClubTime(selectedSlot.starts_at, club.timezone)} →{" "}
                      {formatClubTime(selectedSlot.ends_at, club.timezone)}
                    </p>

                    <div className="mt-5 space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Precio total
                        </span>

                        <span className="font-semibold text-[var(--color-title)]">
                          ${selectedResource.price.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Para reservar
                        </span>

                        <span className="text-lg font-bold text-blue-600">
                          $
                          {selectedResource.deposit_amount.toLocaleString(
                            "es-AR",
                          )}
                        </span>
                      </div>
                    </div>
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
          </>
        )}
      </div>
    </main>
  );
}
