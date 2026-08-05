import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-hover)]">

      <aside className="w-72 border-r bg-[var(--color-card)]">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto bg-[var(--color-background)] p-8">
        <Outlet />
      </main>

    </div>
  );
}