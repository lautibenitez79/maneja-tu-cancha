import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock, Send } from "lucide-react";
import { SiteLayout } from "../components/site/SiteLayout";
import { toast } from "sonner";

// export const Route = createFileRoute("/contacto")({
//   head: () => ({
//     meta: [
//       { title: "Contacto — Maneja Tu Cancha" },
//       {
//         name: "description",
//         content:
//           "Escribinos por WhatsApp o mail. Te ayudamos a configurar tu cancha y responder cualquier duda.",
//       },
//       { property: "og:title", content: "Contacto — Maneja Tu Cancha" },
//       { property: "og:description", content: "Estamos para ayudarte." },
//       { property: "og:url", content: "/contacto" },
//     ],
//     links: [{ rel: "canonical", href: "/contacto" }],
//   }),
//   component: Contacto,
// });

function Contacto() {
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (sending) return;

    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    try {
      const response = await fetch(
        "/api/notifications/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            template: "contactForm",
            data: {
              name,
              email,
              company,
              message,
            },
          }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Error enviando contacto:", result);

        throw new Error(result?.error || "No se pudo enviar el mensaje.");
      }

      toast.success("¡Mensaje enviado! Te respondemos a la brevedad.");

      form.reset();
    } catch (error) {
      console.error("Error enviando formulario de contacto:", error);

      toast.error("No pudimos enviar el mensaje. Intentá nuevamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        {/* Glow */}
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Contacto
            </span>

            <h1 className="mt-8 text-5xl font-semibold font-black tracking-tight md:text-7xl">
              Hablemos de
              <br />
              tu complejo deportivo.
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
              Nuestro equipo puede ayudarte a configurar la plataforma, resolver
              dudas y mostrarte cómo digitalizar la administración de tu cancha.
            </p>
          </motion.div>

          <div className="mt-24 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="rounded-[32px] border border-border bg-card p-10 shadow-xl backdrop-blur-xl md:p-12"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" name="name" required />

                <Field label="Mail" name="email" type="email" required />
              </div>

              <div className="mt-4">
                <Field label="Empresa o Club" name="company" />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium">
                  Mensaje
                </label>

                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full resize-none rounded-[var(--radius-card)] border border-input bg-background px-5 py-4 text-base outline-none transition-colors focus:border-primary"
                  placeholder="Contanos sobre tu cancha..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />

                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </motion.form>

            <div className="space-y-3">
              <InfoCard
                icon={MessageCircle}
                title="WhatsApp"
                text="+54 9 11 0000-0000"
                accent="success"
              />

              <InfoCard
                icon={Mail}
                title="Mail"
                text="hola@manejatucancha.com.ar"
              />

              <InfoCard
                icon={Clock}
                title="Horario de atención"
                text="Lunes a viernes · 9 a 19 hs"
              />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="h-14 w-full rounded-[var(--radius-card)] border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  accent?: "success";
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          accent === "success"
            ? "bg-success/15 text-success"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

export default Contacto;
