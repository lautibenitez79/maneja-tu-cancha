import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Settings,
  CalendarCheck,
  Check,
} from "lucide-react";
import { SiteLayout } from "../components/site/SiteLayout";
import { Typewriter } from "../components/site/Typewriter";

const sports = ["Fútbol", "Paddle", "Tenis", "Hockey", "Básquet", "Vóley", "Cualquier deporte"];

const steps = [
  { icon: UserPlus, title: "Creá tu cuenta", text: "Registro simple en menos de un minuto." },
  { icon: Settings, title: "Configurá tu cancha", text: "Cargá horarios, precios y disciplinas." },
  { icon: CalendarCheck, title: "Empezá a recibir reservas", text: "Tus clientes reservan online 24/7." },
];

const benefits = [
  "Reservas online",
  "Gestión de clientes",
  "Control de horarios",
  "Estadísticas en tiempo real",
  "Acceso desde el celular",
  "Soporte personalizado",
  "Fácil de usar",
  "Sin instalaciones",
];

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}

<section className="relative flex min-h-[92vh] items-center overflow-hidden">

  {/* Background */}
  <div className="absolute inset-0 -z-20 bg-background" />

  {/* Grid */}
  <div
    className="absolute inset-0 -z-10 opacity-[0.05]"
    style={{
      backgroundImage: `
      linear-gradient(to right, currentColor 1px, transparent 1px),
      linear-gradient(to bottom, currentColor 1px, transparent 1px)
    `,
      backgroundSize: "48px 48px",
    }}
  />

  {/* Glow */}
  <div className="absolute left-1/2 top-24 -z-10 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

  <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center mt-14 mb-4 md:mt-2 mb-2">

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .15 }}
      className="mt-10 max-w-5xl text-5xl font-black leading-[1.05] tracking-tight md:text-7xl"
    >
      Administrá tu cancha
      <br />
      <span className="bg-gradient-to-r from-primary via-blue-400 to-success bg-clip-text text-transparent">
        como un profesional.
      </span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .3 }}
      className="mt-8 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl"
    >
      Reservas online, clientes, estadísticas, pagos y administración
      completa desde cualquier dispositivo.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: .45 }}
      className="mt-12 flex flex-col gap-4 sm:flex-row"
    >

      <Link
        to="/login"
        className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.35)] transition hover:scale-105"
      >
        Comenzar Gratis
      </Link>

      <a
        href="#como-funciona"
        className="rounded-full border border-border bg-card px-8 py-4 text-base font-semibold backdrop-blur-xl transition hover:bg-secondary"
      >
        Ver demostración
      </a>

    </motion.div>

    <div className="mt-14 h-10 text-2xl font-semibold">

      <Typewriter
        words={[
          "Reservas online.",
          "Clientes.",
          "Pagos.",
          "Estadísticas.",
          "Todo desde un solo lugar.",
        ]}
      />

    </div>

    <div className="mt-16 flex flex-wrap justify-center gap-3">

      {sports.map((sport) => (

        <span
          key={sport}
          className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm backdrop-blur-xl"
        >
          {sport}
        </span>

      ))}

    </div>

  </div>

</section>

      {/* COMO FUNCIONA */}

<section
  id="como-funciona"
  className="relative overflow-hidden border-t border-border/60 py-28"
>

  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-secondary/20" />

  <div className="mx-auto max-w-7xl px-6">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl text-center"
    >

      <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
        Cómo funciona
      </span>

      <h2 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
        Empezá en menos
        <br />
        de cinco minutos.
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        Diseñamos la plataforma para que cualquier club pueda comenzar
        sin conocimientos técnicos.
      </p>

    </motion.div>

    <div className="mt-24 grid gap-8 lg:grid-cols-3">

      {steps.map((step, index) => (

        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: index * .15,
            duration: .45,
          }}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-3 hover:border-primary/40 hover:shadow-[0_20px_80px_rgba(59,130,246,.18)]"
        >

          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />

          <div className="relative">

            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-primary/10 text-primary">

              <step.icon className="h-8 w-8" />

            </div>

            <span className="text-sm font-semibold text-primary">
              Paso {index + 1}
            </span>

            <h3 className="mt-4 text-2xl font-bold">
              {step.title}
            </h3>

            <p className="mt-4 leading-7 text-muted-foreground">
              {step.text}
            </p>

          </div>

        </motion.div>

      ))}

    </div>

  </div>

</section>

      {/* BENEFICIOS */}

<section className="relative overflow-hidden border-t border-border/60 py-32">

  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/20 via-background to-background" />

  <div className="mx-auto max-w-7xl px-6">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl text-center"
    >

      <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
        Todo incluido
      </span>

      <h2 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
        Todo lo que necesita
        <br />
        un complejo deportivo.
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        No necesitás instalar programas ni aprender sistemas complicados.
        Todo está pensado para administrar tu cancha de forma simple.
      </p>

    </motion.div>

    <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {benefits.map((benefit, index) => (

        <motion.div
          key={benefit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: index * .05
          }}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_80px_rgba(59,130,246,.15)]"
        >

          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />

          <div className="relative">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] bg-primary/10">

              <Check className="h-7 w-7 text-primary" />

            </div>

            <h3 className="text-xl font-semibold">
              {benefit}
            </h3>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">

              Disponible desde el primer día, sin configuraciones
              complicadas y pensado para trabajar desde cualquier
              dispositivo.

            </p>

          </div>

        </motion.div>

      ))}

    </div>

  </div>

</section>

      {/* CTA FINAL */}

<section className="relative overflow-hidden border-t border-border/60 py-32">

  <div className="absolute inset-0 bg-background" />

  <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[170px]" />

  <div className="relative mx-auto max-w-7xl px-6">

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-[40px] border border-border bg-card"
    >

      <div className="grid lg:grid-cols-2">

        {/* IZQUIERDA */}

        <div className="p-10 md:p-16">

          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Soporte personalizado
          </span>

          <h2 className="mt-8 text-4xl font-black leading-tight md:text-6xl">

            Tu cancha
            <br />

            lista para recibir
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              {" "}reservas.
            </span>

          </h2>

          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">

            Nuestro equipo configura todo por vos.
            En pocos minutos vas a tener la plataforma funcionando
            y lista para comenzar a vender horarios online.

          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">

            <Link
              to="/login"
              className="rounded-full bg-primary px-8 py-4 text-center text-base font-semibold text-primary-foreground shadow-[0_0_40px_rgba(59,130,246,.35)] transition hover:scale-105"
            >
              Empezar Gratis
            </Link>

            <Link
              to="/contacto"
              className="rounded-full border border-border bg-background px-8 py-4 text-center text-base font-semibold transition hover:bg-secondary"
            >
              Hablar con un asesor
            </Link>

          </div>

        </div>

        {/* DERECHA */}

        <div className="flex items-center p-10 md:p-16">

          <div className="grid w-full gap-5">

            {[
              "Configuración inicial incluida",
              "Reservas online 24/7",
              "Soporte por WhatsApp",
              "Actualizaciones automáticas",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-background/70 p-5 backdrop-blur-xl"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">

                  <Check className="h-6 w-6 text-primary" />

                </div>

                <div>

                  <p className="font-semibold">

                    {item}

                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">

                    Disponible desde el primer día.

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </motion.div>

  </div>

</section>
    </SiteLayout>
  );
}

export default Home;