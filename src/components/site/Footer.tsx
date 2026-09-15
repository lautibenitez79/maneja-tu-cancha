import {
  ArrowRight,
  Mail,
  SortDescIcon,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

const CONTACT = {
  whatsapp: "5491158820265",
  instagram: "manejatucancha",
  email: "manejatucancha@gmail.com",
};

export function Footer() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
    useEffect(() => {
      const savedTheme = localStorage.getItem("theme");
  
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    }, []);

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">

      {/* Glow */}

      <div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* CTA */}

        <div className="py-28">

          <div className="overflow-hidden rounded-[36px] border border-border bg-card">

            <div className="grid gap-10 p-10 lg:grid-cols-2 lg:p-16">

              <div>

                <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">

                  ¿Listo para empezar?

                </span>

                <h2 className="mt-8 text-4xl font-black leading-tight md:text-5xl">

                  Empezá hoy mismo
                  <br />

                  a administrar
                  <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">

                    {" "}tu cancha.

                  </span>

                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">

                  Probá la plataforma sin compromiso y descubrí
                  cómo cientos de complejos deportivos organizan
                  sus reservas desde un único lugar.

                </p>

              </div>

              <div className="flex items-center justify-start lg:justify-end">

                <div className="flex flex-col gap-4 sm:flex-row">

                  <Link
                    to="/login"
                    className="rounded-full bg-primary px-8 py-4 text-center font-semibold text-white shadow-[0_0_40px_rgba(59,130,246,.35)] transition hover:scale-105"
                  >

                    Comenzar Gratis

                  </Link>

                  <Link
                    to="/contacto"
                    className="rounded-full border border-border bg-background px-8 py-4 text-center font-semibold transition hover:bg-secondary"
                  >

                    Contactar

                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="grid gap-14 border-t border-border py-20 md:grid-cols-2 lg:grid-cols-4">

          <div>

            <div className="flex items-center gap-3">

              <Link
                to="/"
                className="flex h-16 items-center gap-3"
              >

                {theme === "dark" ? (
                  <img
                    src="/MANEJA-TU-CANCHA-DARK.png"
                    alt="Maneja Tu Cancha"
                    className="h-15 w-auto"
                  />
                ) : (
                  <img
                    src="/MANEJA-TU-CANCHA-LIGHT-SIN-FONDO.png"
                    alt="Maneja Tu Cancha"
                    className="h-15 w-auto"
                  />
                )}

              </Link>

            </div>

            <p className="mt-6 leading-7 text-muted-foreground">

              Plataforma para administrar reservas,
              clientes, horarios y pagos de cualquier
              complejo deportivo.

            </p>

          </div>

          <div>

            <h4 className="font-semibold">

              Navegación

            </h4>

            <div className="mt-6 flex flex-col gap-4">

              <Link to="/">Inicio</Link>

              <Link to="/quienes-somos">Nosotros</Link>

              <Link to="/contacto">Contacto</Link>

              <Link to="/login">Ingresar</Link>

            </div>

          </div>

          <div>

            <h4 className="font-semibold">

              Contacto

            </h4>

            <div className="space-y-2">
                    <Link
                      to={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
                        "Hola, estoy interesado en Maneja Tu Cancha y quisiera hacer una consulta.",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                    >
                      <div className="grid h-10 w-10  text-primary">
                        <img height="32" width="32" src="https://cdn.simpleicons.org/whatsapp" />
                      </div>

                      <div>
                        <p className="text-sm text-[var(--color-title)] font-medium">
                          WhatsApp
                        </p>
                      </div>
                    </Link>

                    <Link
                      to={`https://instagram.com/${CONTACT.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <img height="32" width="32" src="https://cdn.simpleicons.org/instagram" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-title)]">
                          Instagram
                        </p>
                      </div>
                    </Link>

                    <Link
                      to={`mailto:${CONTACT.email}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary hover:bg-primary/5"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-title)]">
                          Email
                        </p>
                      </div>
                    </Link>
                  </div>

          </div>

          <div>

            <h4 className="font-semibold">

              Seguinos

            </h4>

            <div className="mt-6 flex gap-4">

              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] border border-border transition hover:bg-secondary"
              >

                <SortDescIcon />

              </a>

            </div>

            <Link
              to="/login"
              className="mt-10 inline-flex items-center gap-2 font-semibold text-primary"
            >

              Crear cuenta

              <ArrowRight className="h-4 w-4" />

            </Link>

          </div>

        </div>

        <div className="border-t border-border py-8 text-center text-sm text-muted-foreground">

          © {new Date().getFullYear()} Maneja Tu Cancha · Todos los derechos reservados.

        </div>

      </div>

    </footer>
  );
}