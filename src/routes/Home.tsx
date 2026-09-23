import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Settings,
  CalendarCheck,
  Check,
  CalendarDays,
  Users,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { SiteLayout } from "../components/site/SiteLayout";
import { Typewriter } from "../components/site/Typewriter";
import WarpText from "@/components/ui/WarpText/WarpText";
import SpecularButton from "@/components/ui/SpecularButton/SpecularButton";
import InteractiveFootballField from "@/components/ui/Background/InteractiveFootballField";

const steps = [
  {
    icon: UserPlus,
    title: "Creá tu cuenta",
    text: "Podes registrarte completando el formulario o podes hacerlo con Google.",
  },
  {
    icon: Settings,
    title: "Configurá tu cancha",
    text: "Cargá tu complejo, horarios y precios y listo!",
  },
  {
    icon: CalendarCheck,
    title: "Empezá a recibir reservas",
    text: "Tus clientes reservan y pagan de manera segura con Mercado Pago.",
  },
];

const benefits = [
  "Sistema de gestión de turnos",
  "Gestión de caja y stock",
  "Reportes estadísticos",
  "Multiusuario",
  "Multiplataforma (celular, pc, tablet)",
  "Información de las canchas",
  "Automatización de reservas",
  "Soporte 24/7",
  "Asesoramiento para optimizar tu club",

];

function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateMobile();

    mediaQuery.addEventListener("change", updateMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateMobile);
    };
  }, []);
  return (
    <SiteLayout>
      {/* HERO */}

      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        {/* CANCHA INTERACTIVA */}

        <div className="absolute inset-0 z-0">
          <InteractiveFootballField
            desktopImageSrc="/cancha.jpg"
            mobileImageSrc="/cancha-mobile.jpg"
            className="h-full min-h-[92vh] w-full"
          />
        </div>

        {/* OVERLAY PARA QUE EL TEXTO SE LEA */}
        <div className="absolute inset-0 z-[1] bg-background/65" />

        {/* Grid */}
        <div
          className="absolute inset-0 z-[2] opacity-[0.05]"
          style={{
            backgroundImage: `
        linear-gradient(to right, currentColor 1px, transparent 1px),
        linear-gradient(to bottom, currentColor 1px, transparent 1px)
      `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow */}
        <div className="absolute left-1/2 top-24 z-[2] -z-0 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center mt-14 mb-4 md:mt-2 mb-2">
          {isMobile ? (
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--color-title)]">
              Administrá tu cancha
            </h1>
          ) : (
            <WarpText
              text="Administrá tu cancha"
              warpStrength={0.08}
              warpScale={1.7}
              speed={1.05}
              pointerInfluence={0.42}
              pointerStrength={0.38}
              refraction={0.018}
              ripple
              fontSize={82}
              fontWeight={600}
              style={{ color: "text-[var(--color-title)]" }}
              fontFamily="inherit"
              letterSpacing={0}
              lineHeight={0.9}
            />
          )}

          <div className="mt-6 h-10 text-base font-semibold md:text-2xl md:mt-10">
            {!isMobile && (
              <div className="mt-6 h-10 text-base font-semibold md:text-2xl md:mt-10">
                <Typewriter
                  words={[
                    "Reservas online.",
                    "Clientes.",
                    "Pagos.",
                    "Estadísticas.",
                    "Administración completa desde cualquier dispositivo.",
                  ]}
                />
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/login">
              {theme === "dark" ? (
                <SpecularButton
                  size="lg"
                  radius={18}
                  tint="#ffffff"
                  tintOpacity={0}
                  blur={0}
                  textColor="#ffffff"
                  lineColor="#ffffff"
                  baseColor="#2b7fff"
                  intensity={1}
                  shineSize={10}
                  shineFade={40}
                  thickness={1}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate={false}
                >
                  Comenzar Gratis
                </SpecularButton>
              ) : (
                <SpecularButton
                  size="lg"
                  radius={18}
                  tint="#ffffff"
                  tintOpacity={0}
                  blur={0}
                  textColor="text-[var(--color-title)]"
                  lineColor="text-[var(--color-title)]"
                  baseColor="#2b7fff"
                  intensity={1}
                  shineSize={10}
                  shineFade={40}
                  thickness={1}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate={false}
                >
                  Comenzar Gratis
                </SpecularButton>
              )}
            </Link>

            <a href="#como-funciona">
              {theme === "dark" ? (
                <SpecularButton
                  size="lg"
                  radius={18}
                  tint="#ffffff"
                  tintOpacity={0}
                  blur={0}
                  textColor="#ffffff"
                  lineColor="#ffffff"
                  baseColor="#2b7fff"
                  intensity={1}
                  shineSize={10}
                  shineFade={40}
                  thickness={1}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate={false}
                >
                  Ver demostración
                </SpecularButton>
              ) : (
                <SpecularButton
                  size="lg"
                  radius={18}
                  tint="#ffffff"
                  tintOpacity={0}
                  blur={0}
                  textColor="text-[var(--color-title)]"
                  lineColor="text-[var(--color-title)]"
                  baseColor="#2b7fff"
                  intensity={1}
                  shineSize={10}
                  shineFade={40}
                  thickness={1}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate={false}
                >
                  Ver demostración
                </SpecularButton>
              )}
            </a>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTO */}

      <section className="relative overflow-hidden border-t border-border/60 py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-secondary/10 to-background" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* TEXTO */}

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >

              <h2 className="mt-8 text-3xl font-black tracking-tight md:text-5xl">
                Tu complejo, tu lugar.
                <br />
                En una sola plataforma.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Administrá reservas, horarios, clientes, pagos y el rendimiento
                de tu complejo desde una plataforma simple y accesible desde
                cualquier dispositivo.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: CalendarDays,
                    title: "Calendario",
                    text: "Visualizá y administrá todas tus reservas.",
                  },
                  {
                    icon: Users,
                    title: "Usuarios",
                    text: "Podras administrar y dar roles a tus empleados.",
                  },
                  {
                    icon: CreditCard,
                    title: "Pagos",
                    text: "Recibí señas y pagos se manera segura con Mercado pago.",
                  },
                  {
                    icon: BarChart3,
                    title: "Estadísticas",
                    text: "Conocé el rendimiento de tu complejo.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-border bg-card/70 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{item.title}</h3>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* VIDEO DEMO */}

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-[100px]" />

              <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl">
                <video
                  className="block w-full"
                  src="/vvvv.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </div>
            </motion.div>
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

            <h2 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
              Empezar
              <br />
              nunca fue tan facil.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Diseñamos la plataforma para que cualquier club pueda comenzar sin
              conocimientos técnicos. En 5 simples pasos comenzas a trabajar de manera optima!
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
                  delay: index * 0.15,
                  duration: 0.45,
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

                  <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>

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

      <section className="relative overflow-hidden border-t border-border/60 py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/20 via-background to-background" />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >

            <h2 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
              Todo lo que necesitás
              <br />
              para administrar mejor.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Una plataforma pensada para que tengas el control de tu complejo,
              ahorres tiempo y puedas recibir reservas todos los días.
            </p>
          </motion.div>

          <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.05,
                }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_80px_rgba(59,130,246,.15)]"
              >
                <div className="absolute right-0 top-0 h-25 w-25 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />

                <div className="relative text-center flex flex-col items-center">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] bg-primary/10">
                    <Check className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold">{benefit}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mx-auto mt-20 max-w-3xl text-center">
            <Link to="/funcionabilidades">
                {theme === "dark" ? (
                  <SpecularButton
                    size="lg"
                    radius={18}
                    tint="#ffffff"
                    tintOpacity={0}
                    blur={0}
                    textColor="#ffffff"
                    lineColor="#ffffff"
                    baseColor="#2b7fff"
                    intensity={1}
                    shineSize={10}
                    shineFade={40}
                    thickness={1}
                    speed={0.35}
                    followMouse
                    proximity={250}
                    autoAnimate={false}
                  >
                    Ver funcionabilidades
                  </SpecularButton>
                ) : (
                  <SpecularButton
                    size="lg"
                    radius={18}
                    tint="#ffffff"
                    tintOpacity={0}
                    blur={0}
                    textColor="text-[var(--color-title)]"
                    lineColor="text-[var(--color-title)]"
                    baseColor="#2b7fff"
                    intensity={1}
                    shineSize={10}
                    shineFade={40}
                    thickness={1}
                    speed={0.35}
                    followMouse
                    proximity={250}
                    autoAnimate={false}
                  >
                    Ver funcionabilidades
                  </SpecularButton>
                )}
            </Link>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section
        id="planes"
        className="relative overflow-hidden border-t border-border/60 py-32"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-secondary/10 to-background" />

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Planes simples
            </span>

            <h2 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
              Elegí cómo
              <br />
              querés empezar.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Probá Maneja Tu Cancha gratis durante 1 semana y elegí el plan que
              mejor se adapte a tu complejo.
            </p>
          </motion.div>

          <div className="mx-auto mt-20 grid max-w-6xl gap-6 lg:grid-cols-3">
            {/* PLAN MENSUAL */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[32px] border border-border bg-card p-8 md:p-9"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Mensual
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight">
                  $60.000
                </span>

                <span className="mb-2 text-muted-foreground">/ mes</span>
              </div>

              <p className="mt-4 min-h-[48px] text-muted-foreground">
                La opción ideal para comenzar con flexibilidad.
              </p>

              <div className="my-8 h-px bg-border" />

              <div className="space-y-4">
                {[
                  "Reservas online",
                  "Calendario de disponibilidad",
                  "Gestión de clientes",
                  "Control de horarios",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>

                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/login"
                className="mt-10 block rounded-full border border-border bg-background px-6 py-4 text-center font-semibold transition hover:bg-secondary"
              >
                Comenzar gratis
              </Link>
            </motion.div>

            {/* PLAN 3 MESES */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative rounded-[32px] border border-primary/30 bg-card p-8 md:p-9"
            >
              <div className="absolute right-6 top-6 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                3+1
              </div>

              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                3 meses
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight">
                  $55.000
                </span>
              </div>

              <p className="mt-2 font-medium text-primary">
                $165.000 por los 3 meses
              </p>

              <p className="mt-3 min-h-[48px] text-muted-foreground">
                Pagá 3 meses y disfrutá el 4.º mes gratis.
              </p>

              <div className="my-8 h-px bg-border" />

              <div className="space-y-4">
                {[
                  "Reservas online",
                  "Calendario de disponibilidad",
                  "Gestión de clientes",
                  "Control de horarios",
                  "Pagos online",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>

                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/login"
                className="mt-10 block rounded-full border border-primary/30 bg-primary/5 px-6 py-4 text-center font-semibold text-primary transition hover:bg-primary/10"
              >
                Comenzar gratis
              </Link>
            </motion.div>

            {/* PLAN ANUAL */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="relative rounded-[32px] border border-primary/50 bg-card p-8 shadow-[0_20px_100px_rgba(59,130,246,.18)] md:p-9"
            >
              <div className="absolute right-6 top-6 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                MEJOR VALOR
              </div>

              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Anual
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight">
                  $40.000
                </span>

                <span className="mb-2 text-muted-foreground">/ año</span>
              </div>

              <p className="mt-2 font-medium text-primary">
                Equivale a $480.000 por año
              </p>

              <p className="mt-3 min-h-[48px] text-muted-foreground">
                La opción más completa para administrar tu complejo durante todo
                el año.
              </p>

              <div className="my-8 h-px bg-border" />

              <div className="space-y-4">
                {[
                  "Todas las funcionalidades",
                  "Reservas online 24/7",
                  "Gestión de clientes",
                  "Pagos online",
                  "Estadísticas en tiempo real",
                  "Soporte personalizado",
                  "Acceso desde cualquier dispositivo",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>

                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/login"
                className="mt-10 block rounded-full bg-primary px-6 py-4 text-center font-semibold text-primary-foreground shadow-[0_0_40px_rgba(59,130,246,.25)] transition hover:scale-[1.02]"
              >
                Comenzar gratis
              </Link>
            </motion.div>
          </div>

          {/* CONDICIONES */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-10 max-w-6xl"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                <p className="font-bold">Probá gratis durante 1 semana</p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Conocé la plataforma y empezá a administrar tu complejo
                  durante los primeros 7 días sin costo.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                <p className="font-bold">Promoción 3+1</p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Contratá 3 meses por $180.000 y obtené el 4.º mes gratis.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              El plan anual puede abonarse en un pago de $480.000 o en 3 cuotas
              sin interés de $160.000.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}

      <section className="relative overflow-hidden border-t border-border/60 py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-secondary/10 to-background" />

        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Preguntas frecuentes
            </span>

            <h2 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">
              Todo lo que necesitás
              <br />
              saber antes de empezar.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Si todavía tenés dudas, acá encontrás las respuestas más
              importantes.
            </p>
          </motion.div>

          <div className="mt-16 space-y-4">
            {[
              {
                question: "¿Tengo una prueba gratuita?",
                answer:
                  "Sí. Las nuevas cuentas cuentan con una prueba gratuita de 1 semana para conocer la plataforma y comenzar a administrar tu complejo.",
              },
              {
                question: "¿Qué incluye el plan?",
                answer:
                  "Todos los planes incluyen las funcionalidades de Maneja Tu Cancha: reservas online, gestión de clientes, horarios, pagos, estadísticas y acceso desde cualquier dispositivo.",
              },
              {
                question: "¿Mis clientes pueden reservar online?",
                answer:
                  "Sí. Podés compartir el link público de reservas de tu complejo para que tus clientes consulten disponibilidad y realicen sus reservas online.",
              },
              {
                question: "¿Puedo recibir pagos online?",
                answer:
                  "Sí. Maneja Tu Cancha permite configurar pagos online para que tus clientes puedan abonar sus reservas.",
              },
              {
                question: "¿Puedo contratar el plan anual en cuotas?",
                answer:
                  "Sí. El plan anual tiene un valor total de $480.000 y puede abonarse en un pago o en 3 cuotas sin interés de $160.000.",
              },
              {
                question: "¿Qué es la promoción 3+1?",
                answer: "Si contratás 3 meses, obtenés el 4.º mes gratis.",
              },
            ].map((item, index) => (
              <motion.details
                key={item.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-2xl border border-border bg-card px-6 py-5"
              >
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold marker:hidden">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.question}</span>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="max-w-3xl pt-4 pr-10 text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
      
    </SiteLayout>
  );
}

export default Home;
