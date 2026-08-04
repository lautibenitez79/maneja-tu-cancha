import { NavLink } from "react-router-dom";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Recursos",
    href: "/dashboard/resources",
  },
];

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col">

      <div className="border-b p-6">

        <h1 className="text-2xl font-bold text-blue-600">
          Maneja Tu Cancha
        </h1>

      </div>

      <nav className="flex-1 p-4">

        {items.map((item) => (

          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `mb-2 flex rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>

        ))}

      </nav>

    </div>
  );
}