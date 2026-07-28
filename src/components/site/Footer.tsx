import {
  ArrowRight,
  Mail,
  Phone,
  SortDescIcon,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

export function Footer() {
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

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-xl font-bold text-white">

                M

              </div>

              <div>

                <p className="text-lg font-bold">

                  Maneja Tu Cancha

                </p>

                <p className="text-sm text-muted-foreground">

                  Administración deportiva

                </p>

              </div>

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

            <div className="mt-6 space-y-5 text-muted-foreground">

              <div className="flex items-center gap-3">

                <Mail className="h-4 w-4" />

                hola@manejatucancha.com.ar

              </div>

              <div className="flex items-center gap-3">

                <Phone className="h-4 w-4" />

                +54 9 11 0000-0000

              </div>

              <div className="flex items-center gap-3">

                <MapPin className="h-4 w-4" />

                Buenos Aires, Argentina

              </div>

            </div>

          </div>

          <div>

            <h4 className="font-semibold">

              Seguinos

            </h4>

            <div className="mt-6 flex gap-4">

              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border transition hover:bg-secondary"
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