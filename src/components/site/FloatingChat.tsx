import { useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  MessageSquare,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  type: "support" | "user";
  text: string;
};

type View = "chat" | "contact";

const CONTACT = {
  whatsapp: "5491158820265",
  instagram: "manejatucancha",
  email: "manejatucancha@gmail.com",
};

const quickQuestions = [
  "¿Cómo funciona?",
  "¿Cuánto cuesta?",
  "¿Cómo creo mi cancha?",
  "¿Cómo conecto Mercado Pago?",
];

function getResponse(message: string): string {
  const text = message.toLowerCase();

  if (
    text.includes("precio") ||
    text.includes("cuesta") ||
    text.includes("plan") ||
    text.includes("planes")
  ) {
    return "Tenemos un plan mensual de $60.000 y un plan anual equivalente a $40.000 por mes. Además, tenés 1 semana gratis para probar Maneja Tu Cancha.";
  }

  if (
    text.includes("cómo funciona") ||
    text.includes("como funciona") ||
    text.includes("funciona")
  ) {
    return "Maneja Tu Cancha te permite administrar tus canchas, horarios, reservas, clientes y pagos desde un solo lugar.";
  }

  if (
    text.includes("crear") ||
    text.includes("cancha") ||
    text.includes("configurar")
  ) {
    return "Podés crear y configurar tus canchas desde el panel de administración, definiendo horarios, duración, disponibilidad y demás opciones.";
  }

  if (
    text.includes("mercado pago") ||
    text.includes("mercadopago") ||
    text.includes("pago")
  ) {
    return "Podés conectar tu cuenta de Mercado Pago para recibir pagos de tus clientes directamente desde las reservas.";
  }

  return "No estoy seguro de haber entendido tu consulta. Podés ponerte en contacto con nosotros y te ayudamos personalmente.";
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chat");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "support",
      text: "¡Hola! 👋 Somos el equipo de Maneja Tu Cancha. ¿En qué podemos ayudarte?",
    },
    {
      id: 2,
      type: "support",
      text: "Configurá tu complejo en menos de 5 minutos.",
    },
  ]);

  const [input, setInput] = useState("");

  function sendMessage(text: string) {
    const cleanText = text.trim();

    if (!cleanText) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: cleanText,
    };

    const supportMessage: Message = {
      id: Date.now() + 1,
      type: "support",
      text: getResponse(cleanText),
    };

    setMessages((current) => [
      ...current,
      userMessage,
      supportMessage,
    ]);

    setInput("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleQuickQuestion(question: string) {
    sendMessage(question);
  }

  function handleClose() {
    setOpen(false);
    setView("chat");
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 16,
              scale: 0.96,
            }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[86vw] max-w-sm overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-card shadow-[var(--shadow-soft)]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
              <div>
                <p className="text-sm font-semibold">
                  Soporte Maneja Tu Cancha
                </p>

                <p className="text-xs opacity-80">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />
                  En línea
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar chat"
                className="rounded-full p-1 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {view === "chat" ? (
              <>
                {/* MENSAJES */}
                <div className="max-h-64 space-y-3 overflow-y-auto p-4 text-sm">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{
                        opacity: 0,
                        y: 6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={
                        message.type === "support"
                          ? "max-w-[85%] rounded-[var(--radius-card)] rounded-tl-sm bg-secondary px-3 py-2 text-foreground"
                          : "ml-auto max-w-[85%] rounded-[var(--radius-card)] rounded-tr-sm bg-primary px-3 py-2 text-primary-foreground"
                      }
                    >
                      {message.text}
                    </motion.div>
                  ))}
                </div>

                {/* PREGUNTAS RÁPIDAS */}
                <div className="space-y-2 px-4 pb-3">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        handleQuickQuestion(question)
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition hover:border-primary hover:text-primary"
                    >
                      {question}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setView("contact")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition hover:bg-primary/20"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ponerte en contacto
                  </button>
                </div>

                {/* INPUT */}
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 border-t border-border/60 p-3"
                >
                  <input
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                    placeholder="Escribí un mensaje..."
                  />

                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* CONTACTO */}
                <div className="p-4">
                  <button
                    type="button"
                    onClick={() => setView("chat")}
                    className="mb-4 flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </button>

                  <div className="mb-5">
                    <h3 className="text-base font-semibold text-foreground">
                      Ponete en contacto
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Elegí cómo querés comunicarte con nosotros.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <a
                      href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
                        "Hola, estoy interesado en Maneja Tu Cancha y quisiera hacer una consulta.",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          WhatsApp
                        </p>

                        <p className="text-xs text-muted-foreground">
                          11 5882-0265
                        </p>
                      </div>
                    </a>

                    <a
                      href={`https://instagram.com/${CONTACT.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <img height="32" width="32" src="https://cdn.simpleicons.org/instagram" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Instagram
                        </p>

                        <p className="text-xs text-muted-foreground">
                          @{CONTACT.instagram}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Email
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {CONTACT.email}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
        aria-label={
          open ? "Cerrar soporte" : "Abrir soporte"
        }
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}