import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["admin", "user"],
  },
  {
    label: "Recursos",
    href: "/dashboard/resources",
    roles: ["admin"],
  },
  {
    label: "Calendario",
    href: "/dashboard/calendar",
    roles: ["admin", "user"],
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    roles: ["admin"],
  },
  {
    label: "Reservas",
    href: "/dashboard/reservations",
    roles: ["admin", "user"],
  },
  {
    label: "Suscripción",
    href: "/dashboard/subscription",
    roles: ["admin"],
  },
];

interface Props {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({
  onNavigate,
  collapsed = false,
  onToggle,
}: Props) {
  const navigate = useNavigate();

  const { logout, profile } = useAuth();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  async function handleLogout() {
    try {
      await logout();

      toast.success("Sesión cerrada correctamente.");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Error cerrando sesión:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la sesión.",
      );
    }
  }

  const visibleItems = items.filter(
    (item) =>
      profile &&
      item.roles.includes(profile.role),
  );

  return (
    <div className="flex h-screen min-h-0 flex-col">

      {/* =========================
          HEADER / LOGO
      ========================== */}
      <div
        className={`flex shrink-0 border-b border-[var(--color-border)] ${
          collapsed
            ? "h-20 items-center justify-center px-2"
            : "h-24 items-center px-5 sm:px-6"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className={`flex items-center ${
            collapsed
              ? "justify-center"
              : "w-full"
          }`}
        >
          {collapsed ? (
            /*
             * MARCA COMPACTA
             *
             * Usamos el logo completo dentro de un contenedor
             * angosto para mostrar solamente su parte izquierda.
             */
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden">
              <img
                src={
                  theme === "dark"
                    ? "/MANEJA-TU-CANCHA-DARK.png"
                    : "/MANEJA-TU-CANCHA-LIGHT-SIN-FONDO.png"
                }
                alt="Maneja Tu Cancha"
                className="h-10 w-auto max-w-none shrink-0"
              />
            </div>
          ) : (
            <img
              src={
                theme === "dark"
                  ? "/MANEJA-TU-CANCHA-DARK.png"
                  : "/MANEJA-TU-CANCHA-LIGHT-SIN-FONDO.png"
              }
              alt="Maneja Tu Cancha"
              className="h-20 w-auto"
            />
          )}
        </Link>
      </div>

      {/* =========================
          NAVEGACIÓN
      ========================== */}
      <nav
        className={`flex-1 ${
          collapsed
            ? "px-2 py-4"
            : "p-3 sm:p-4"
        }`}
      >
        {!collapsed &&
          visibleItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-2 flex w-full items-center rounded-xl px-4 py-4 text-sm transition ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : "hover:bg-[var(--color-hover)]"
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* =========================
          FOOTER
      ========================== */}
      <div
        className={`shrink-0 border-t border-[var(--color-border)] ${
          collapsed
            ? "flex flex-col items-center gap-2 p-2"
            : "p-3 sm:p-4"
        }`}
      >

        {/* Abrir / cerrar sidebar */}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Abrir menú" : "Cerrar menú"}
            className={`flex rounded-xl transition hover:bg-[var(--color-hover)] ${
              collapsed
                ? "h-11 w-11 items-center justify-center"
                : "w-full items-center gap-3 px-4 py-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" />
                <span>Cerrar menú</span>
              </>
            )}
          </button>
        )}

        {/* Cerrar sesión */}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`flex rounded-xl text-left text-sm transition hover:bg-[var(--color-hover)] ${
            collapsed
              ? "h-11 w-11 items-center justify-center"
              : "w-full items-center gap-3 px-4 py-3"
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />

          {!collapsed && (
            <span>Cerrar sesión</span>
          )}
        </button>

        {/* User */}
        {profile?.role === "admin" && (
          <button
            type="button"
            onClick={() => {
              navigate("/dashboard/club");
              onNavigate?.();
            }}
            title={collapsed ? "Mi club" : undefined}
            className={`flex rounded-xl text-left text-sm transition hover:bg-[var(--color-hover)] ${
              collapsed
                ? "h-11 w-11 items-center justify-center"
                : "w-full items-center gap-3 px-4 py-3"
            }`}
          >
            <UserRound className="h-5 w-5 shrink-0" />

            {!collapsed && <span>Mi club</span>}
          </button>
)}
      </div>
    </div>
  );
}