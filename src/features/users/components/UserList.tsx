import type { ClubUser } from "../types/user.types";

interface UserListProps {
  users: ClubUser[];
  loading?: boolean;
}

export default function UserList({
  users,
  loading = false,
}: UserListProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Cargando usuarios...
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          No hay usuarios registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-background)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold bg-[var(--color-background)] text-[var(--color-title)]">
                Nombre
              </th>

              <th className="px-6 py-4 text-sm font-semibold bg-[var(--color-background)] text-[var(--color-title)]">
                Email
              </th>

              <th className="px-6 py-4 text-sm font-semibold bg-[var(--color-background)] text-[var(--color-title)]">
                Rol
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="px-6 py-4 text-sm text-[var(--color-title)]">
                  {user.full_name || "Sin nombre"}
                </td>

                <td className="px-6 py-4 text-sm text-[var(--color-title)]">
                  {user.email}
                </td>

                <td className="px-6 py-4 text-sm">
                  <span
                    className={
                      user.role === "admin"
                        ? "font-medium text-[var(--color-title)]"
                        : "text-[var(--color-title)]"
                    }
                  >
                    {user.role === "admin"
                      ? "Administrador"
                      : "Usuario"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}