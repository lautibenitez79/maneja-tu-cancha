import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* DESKTOP */}
      <div className="hidden min-h-screen lg:flex">
        <aside className="w-72 shrink-0 border-r bg-[var(--color-card)]">
          <Sidebar />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* MOBILE / TABLET */}
      <div className="flex min-h-screen flex-col lg:hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-[var(--color-card)] px-4">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-lg p-2 hover:bg-[var(--color-hover)]"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <span className="text-base font-bold text-[var(--color-primary)]">
            Maneja Tu Cancha
          </span>

          <div className="w-9" />
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/30"
            />

            <aside className="relative z-40 h-full w-[280px] max-w-[85vw] bg-[var(--color-card)] shadow-xl">
              <Sidebar
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}