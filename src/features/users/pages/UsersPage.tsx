import { useState } from "react";

import UserList from "../components/UserList";
import UserModal from "../components/UserModal";
import { useUsers } from "../hooks/useUsers";

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    inviteUser,
  } = useUsers();

  const [modalOpen, setModalOpen] =
    useState(false);

  const [inviting, setInviting] =
    useState(false);

  async function handleInvite(data: {
    fullName: string;
    email: string;
  }) {
    try {
      setInviting(true);

      await inviteUser(data);

      setModalOpen(false);
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Usuarios
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Administrá los usuarios de tu complejo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Agregar usuario
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <UserList
        users={users}
        loading={loading}
      />

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInvite}
        loading={inviting}
      />
    </div>
  );
}