import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const nav = [
  {
    to: "/",
    label: "Inicio",
  },
  {
    to: "/quienes-somos",
    label: "Nosotros",
  },
  {
    to: "/contacto",
    label: "Contacto",
  },
];

export function Header() {

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (

    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-4"
          : "py-7"
      }`}
    >

      <div
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-[var(--radius-card)] border px-6 transition-all duration-500 md:px-8 ${
          scrolled
            ? "border-border bg-background/70 shadow-xl backdrop-blur-2xl"
            : "border-transparent bg-transparent"
        }`}
      >

        <Link
          to="/"
          className="flex h-16 items-center gap-3"
        >

          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] bg-gradient-to-br from-primary to-blue-500 text-lg font-bold text-white shadow-[0_0_40px_rgba(59,130,246,.40)]">

            M

          </div>

          <div>

            <p className="text-lg font-bold tracking-tight">

              Maneja Tu Cancha

            </p>

            <p className="text-xs text-muted-foreground">

              Administración deportiva

            </p>

          </div>

        </Link>

        <nav className="hidden items-center gap-10 lg:flex">

          {nav.map((item) => (

            <Link
              key={item.to}
              to={item.to}
              className="relative text-[15px] font-medium text-muted-foreground transition hover:text-foreground"
            >

              {item.label}

            </Link>

          ))}

        </nav>

        <div className="hidden items-center gap-3 lg:flex">

          <Link
            to="/login"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-secondary"
          >
            Ingresar
          </Link>

          <Link
            to="/login"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(59,130,246,.35)] transition hover:scale-105"
          >
            Comenzar
          </Link>

        </div>

        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl lg:hidden"
          onClick={() => setOpen(!open)}
        >

          {open ? <X /> : <Menu />}

        </button>

      </div>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mx-5 mt-4 rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-xl backdrop-blur-xl lg:hidden"
          >

            <div className="flex flex-col gap-5">

              {nav.map((item) => (

                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium"
                >
                  {item.label}
                </Link>

              ))}

              <Link
                to="/login"
                className="mt-3 rounded-full bg-primary py-3 text-center font-semibold text-white"
              >
                Comenzar
              </Link>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </header>

  );

}