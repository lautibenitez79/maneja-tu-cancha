import { motion } from "framer-motion";
import { Lightbulb, Code2, Users, Rocket } from "lucide-react";
import { SiteLayout } from "../components/site/SiteLayout";

// export const Route = createFileRoute("/quienes-somos")({
//   head: () => ({
//     meta: [
//       { title: "Quiénes Somos — Maneja Tu Cancha" },
//       {
//         name: "description",
//         content:
//           "Somos un software creado para digitalizar la administración de clubes y canchas deportivas. Nuestra misión: ahorrar tiempo y aumentar la ocupación.",
//       },
//       { property: "og:title", content: "Quiénes Somos — Maneja Tu Cancha" },
//       {
//         property: "og:description",
//         content: "Digitalizando la administración deportiva.",
//       },
//       { property: "og:url", content: "/quienes-somos" },
//     ],
//     links: [{ rel: "canonical", href: "/quienes-somos" }],
//   }),
//   component: QuienesSomos,
// });

const timeline = [
  { icon: Lightbulb, title: "Idea", text: "Detectamos que administrar canchas seguía siendo manual y caótico." },
  { icon: Code2, title: "Desarrollo", text: "Creamos un software simple, moderno y accesible desde cualquier lugar." },
  { icon: Users, title: "Primeros clientes", text: "Clubes y complejos deportivos confían en nosotros día a día." },
  { icon: Rocket, title: "Expansión", text: "Llegamos a más deportes y ciudades con la misma promesa: simplicidad." },
];

function QuienesSomos() {
  return (
    <SiteLayout>
      <section className="relative">
        <div className="mx-auto max-w-3xl px-5 pt-16 pb-10 text-center md:px-8 md:pt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Digitalizando la administración deportiva.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Somos un software creado para facilitar la administración de clubes
            y canchas deportivas. Nuestra misión es <strong className="text-foreground">ahorrar tiempo</strong> y
            <strong className="text-foreground"> aumentar la ocupación</strong> de las canchas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 md:px-8">
        <div className="relative pl-6 md:pl-10">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-border md:left-4" />
          <div className="space-y-8">
            {timeline.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="relative"
              >
                <span className="absolute -left-6 top-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-primary shadow-[var(--shadow-soft)] md:-left-10">
                  <t.icon className="h-4 w-4" />
                </span>
                <div className="rounded-[var(--radius-card)] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export default QuienesSomos;