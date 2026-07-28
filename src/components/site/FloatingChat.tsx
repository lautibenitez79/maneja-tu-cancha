import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[86vw] max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
              <div>
                <p className="text-sm font-semibold">Soporte Maneja Tu Cancha</p>
                <p className="text-xs opacity-80">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />
                  En línea
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar chat">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto p-4 text-sm">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-foreground">
                ¡Hola! 👋 Somos el equipo de Maneja Tu Cancha. ¿En qué te ayudamos?
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-foreground">
                Configurá tu cancha en menos de 5 minutos.
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border/60 p-3">
              <input
                className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                placeholder="Escribí un mensaje..."
              />
              <button className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
        aria-label="Abrir soporte"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
