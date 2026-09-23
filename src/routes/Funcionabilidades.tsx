import { Header } from "@/components/site/Header";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  MapPin,
  MessageCircle,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

type Feature = {
  id: string;
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

const features: Feature[] = [
  {
    id: "reservas",
    icon: CalendarDays,
    eyebrow: "RESERVAS",
    title: "Gestioná tus reservas sin perderte ningún turno",
    description:
      "Tené todas las reservas de tu complejo organizadas en un calendario claro y fácil de usar. Creá, consultá, cancelá y administrá tus turnos desde un solo lugar.",
    points: [
      "Calendario semanal y diario",
      "Disponibilidad en tiempo real",
      "Creación y cancelación de reservas",
      "Bloqueo de horarios",
      "Información del cliente en cada reserva",
    ],
  },
  {
    id: "canchas",
    icon: MapPin,
    eyebrow: "CANCHAS Y COMPLEJOS",
    title: "Configurá tu complejo exactamente como funciona",
    description:
      "Definí tus canchas, complejos, horarios de atención y duración de los turnos. El sistema se adapta a la estructura de tu complejo.",
    points: [
      "Múltiples canchas",
      "Horarios de apertura y cierre",
      "Horarios diferentes por día",
      "Bloqueos de cancha",
      "Configuración independiente por cancha",
    ],
  },
  {
    id: "pagos",
    icon: CircleDollarSign,
    eyebrow: "Mercado Pago",
    title: "Organizá el estado de tus reservas y pagos",
    description:
      "Utilizamos mercado pago para organizar tus pagos, el metodo más seguro. Tus clientes, reservan, pagan y se confirma.",
    points: [
      "Estado de cada reserva",
      "Pagos pendientes",
      "Reservas confirmadas",
      "Seguimiento desde el calendario",
    ],
  },
  {
    id: "estadisticas",
    icon: BarChart3,
    eyebrow: "ESTADÍSTICAS",
    title: "Transformá tus reservas en información",
    description:
      "Conocé cómo se está utilizando tu complejo y obtené información que te ayude a entender mejor la actividad de tus canchas.",
    points: [
      "Visualización de actividad",
      "Ocupación",
      "Información de reservas",
      "Datos para tomar decisiones",
    ],
  },
];

function CalendarDemo() {
  const [selected, setSelected] = useState("10:00");

  const slots = [
    {
      time: "09:00",
      status: "Disponible",
    },
    {
      time: "10:00",
      status: "Disponible",
    },
    {
      time: "11:00",
      status: "Reservado",
    },
    {
      time: "12:00",
      status: "Disponible",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_80px_rgba(15,23,42,0.12)] md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Complejo deportivo
          </p>

          <h4 className="mt-1 font-bold text-slate-900">Calendario</h4>
        </div>

        <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          Esta semana
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => {
          const isSelected = selected === slot.time;

          const reserved = slot.status === "Reservado";

          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => setSelected(slot.time)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-[var(--color-primary)] bg-blue-50 shadow-md"
                  : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {slot.time}
                </span>

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    reserved ? "bg-red-500" : "bg-green-500"
                  }`}
                />
              </div>

              <p
                className={`mt-2 text-xs font-semibold ${
                  reserved ? "text-red-500" : "text-green-600"
                }`}
              >
                {slot.status}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Clock3 size={18} className="text-[var(--color-primary)]" />
          </div>

          <div>
            <p className="text-xs text-slate-400">Horario seleccionado</p>

            <p className="text-sm font-bold text-slate-800">
              {selected} · Cancha 1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturePlaceholder({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] md:p-8">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/5" />

      <div className="relative">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Maneja Tu Cancha
              </p>

              <h4 className="mt-1 text-lg font-bold text-slate-900">
                {feature.eyebrow}
              </h4>
            </div>
            { feature.id === "pagos" ? (
                    <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)]">                
                        <img src="/mercado-pago.svg" alt="Mercado Pago" />
                    </div>
                    ) : 
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)]">
                        <Icon size={22} />
                    </div>
            }
          </div>

          <div className="mt-6 space-y-3">
            {feature.points.map((point, index) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[var(--color-primary)] shadow-sm">
                  {index + 1}
                </div>

                <span className="text-sm font-medium text-slate-700">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-400">Estado</p>
            <p className="mt-2 text-lg font-bold text-green-600">Activo</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-400">Información</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              En un solo lugar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Funcionalidades() {
  const [activeFeature, setActiveFeature] = useState("reservas");

  const currentFeature =
    features.find((feature) => feature.id === activeFeature) ?? features[0];

  const Icon = currentFeature.icon;

  return (
    <div className="">
      <Header></Header>
      <main className="bg-white">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[var(--color-background)]">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:pb-32 md:pt-40">
            <div className="mx-auto max-w-4xl text-center">

              <h1 className="mt-7 text-5xl font-bold tracking-tight text-[var(--color-title)] md:text-7xl">
                Todo tu complejo.
                <br />
                <span className="text-[var(--color-primary)]">
                  Un solo lugar.
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500 md:text-xl">
                Manejá reservas, canchas, clientes, horarios y pagos desde una
                plataforma diseñada para complejos deportivos.
              </p>

              <button
                type="button"
                onClick={() =>
                  document.getElementById("explorar")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)]"
              >
                Explorar funcionalidades
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* EXPLORADOR */}
        <section
          id="explorar"
          className="scroll-mt-20 border-y border-slate-100 bg-[#111623]"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="max-w-3xl">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Explorá la plataforma
              </span>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--color-primary)] md:text-5xl">
                Una herramienta para cada parte de tu negocio
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-500">
                Elegí una funcionalidad para conocer cómo puede ayudarte en el
                día a día.
              </p>
            </div>

            {/* TABS */}
            <div className="mt-12 flex gap-3 overflow-x-auto pb-3">
              {features.map((feature) => {
                const FeatureIcon = feature.icon;

                const active = activeFeature === feature.id;

                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => setActiveFeature(feature.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    { feature.id === "pagos" ? (
                            <img src="/mercado-pago.svg" className="w-10 h-10" alt="Mercado Pago" />
                        ) : <FeatureIcon size={17} />
                    }

                    {feature.eyebrow}
                  </button>
                );
              })}
            </div>

            {/* FEATURE */}
            <div className="mt-10 grid items-center gap-12 md:grid-cols-2 md:gap-20">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)]">
                        { currentFeature.id === "pagos" ? (
                            <img src="/mercado-pago.svg" className="w-14 h-14" alt="Mercado Pago" />
                        ) : <Icon size={28} /> 
                        }
                    </div>
                </div>

                <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  {currentFeature.eyebrow}
                </p>

                <h3 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                  {currentFeature.title}
                </h3>

                <p className="mt-6 text-lg leading-8 text-slate-500">
                  {currentFeature.description}
                </p>

                <div className="mt-8 space-y-4">
                  {currentFeature.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Check size={14} />
                      </div>

                      <span className="text-sm font-medium text-slate-600 md:text-base">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DEMO */}
              <div className="md:sticky md:top-24">
                {activeFeature === "reservas" ? (
                  <CalendarDemo />
                ) : (
                  <FeaturePlaceholder feature={currentFeature} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PRÓXIMAMENTE */}
        <UpcomingFeatures />

        {/* CTA */}
        <section className="bg-[var(--color-background)] px-6 py-24 text-center md:py-32">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-[var(--color-primary)] md:text-6xl">
            Tu complejo puede funcionar mucho más simple.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
            Probá Maneja Tu Cancha gratis durante un mes y empezá a administrar
            tus reservas de otra manera.
          </p>

          <a
            href="/login"
            className="mt-9 inline-flex rounded-xl bg-[var(--color-success)] px-7 py-4 font-bold text-white transition hover:-translate-y-0.5"
          >
            Probar gratis
          </a>
        </section>
      </main>
    </div>
  );
}

function UpcomingFeatures() {
  return (
    <section className="overflow-hidden bg-[var(--color-background)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
            Próximamente
          </span>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-[var(--color-title)] md:text-6xl">
            Y esto recién empieza.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500">
            Estamos trabajando en nuevas herramientas para que puedas
            administrar todavía más aspectos de tu complejo desde Maneja Tu
            Cancha.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <UpcomingCard
            icon={WalletCards}
            number="01"
            title="Control de stock y caja"
            description="Llevá el control de tus productos, movimientos de caja y operaciones del día desde el mismo lugar donde gestionás tus reservas."
          />

          <UpcomingCard
            icon={MessageCircle}
            number="02"
            title="API de WhatsApp"
            description="Automatizá confirmaciones, recordatorios y comunicaciones con tus clientes directamente desde WhatsApp."
          />
        </div>
      </div>
    </section>
  );
}

function UpcomingCard({
  icon: Icon,
  number,
  title,
  description,
}: {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-[var(--color-background)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:p-10">
      <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-primary)] transition group-hover:scale-150" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)]">
            <Icon size={27} />
          </div>

          <span className="text-sm font-bold text-slate-300">{number}</span>
        </div>

        <div className="mt-8">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            En desarrollo
          </span>

          <h3 className="mt-5 text-2xl font-bold text-[var(--color-title)] md:text-3xl">
            {title}
          </h3>

          <p className="mt-4 text-base leading-7 text-slate-500">
            {description}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
          Próximamente
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
