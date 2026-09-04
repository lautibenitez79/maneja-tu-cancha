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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Nombre
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Email
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
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
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.full_name || "Sin nombre"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>

                <td className="px-6 py-4 text-sm">
                  <span
                    className={
                      user.role === "admin"
                        ? "font-medium text-gray-900"
                        : "text-gray-600"
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