import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Recursos",
    href: "/dashboard/resources",
  },
  {
    label: "Calendario",
    href: "/dashboard/calendar",
  },
];

interface Props {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();

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

  return (
    <div className="flex h-full min-h-screen flex-col">
      {/* Logo */}
      <div className="border-b border-[var(--color-border)] p-5 sm:p-6">
        <h1 className="text-xl font-bold text-[var(--color-primary)] sm:text-2xl">
          Maneja Tu Cancha
        </h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 sm:p-4">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mb-2 flex w-full rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "hover:bg-[var(--color-hover)]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className="border-t border-[var(--color-border)] p-3 sm:p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition hover:bg-[var(--color-hover)]"
        >
          <LogOut className="h-5 w-5 shrink-0" />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}