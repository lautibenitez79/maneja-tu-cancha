import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SpecularButton from "../ui/SpecularButton/SpecularButton";

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

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

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
          >
            {theme === "dark" ? (
                <SpecularButton
                  size="sm"
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
                  Ingresar
                </SpecularButton>
              ) : (
                <SpecularButton
                  size="sm"
                  radius={18}
                  tint="#ffffff"
                  tintOpacity={0}
                  blur={0}
                  textColor="text-[var(--color-title)]"
                  lineColor="text-[var(--color-title)]"
                  baseColor="#2b7fff"
                  intensity={1}
                  shineSize={4}
                  shineFade={40}
                  thickness={1}
                  speed={0.35}
                  followMouse
                  proximity={250}
                  autoAnimate={false}
                >
                  Ingresar
                </SpecularButton>
              )}
          </Link>

          <Link
            to="/login"
          >
            {theme === "dark" ? (
                <SpecularButton
                  size="sm"
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
                  Comenzar
                </SpecularButton>
              ) : (
                <SpecularButton
                  size="sm"
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
                  Comenzar
                </SpecularButton>
              )}
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