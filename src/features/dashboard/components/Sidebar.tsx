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
  // {
  //   label: "Clientes",
  //   href: "/dashboard/customers",
  // },
  {
    label: "Calendario",
    href: "/dashboard/calendar",
  },
];

export default function Sidebar() {
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
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-[var(--color-border)] p-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          Maneja Tu Cancha
        </h1>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `mb-2 flex rounded-xl px-4 py-3 transition ${
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
      <div className="border-t border-[var(--color-border)] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[var(--color-hover)]"
        >
          <LogOut className="h-5 w-5" />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}