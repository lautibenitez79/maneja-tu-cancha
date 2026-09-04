import { useState } from "react";

import type { InviteUserData } from "../types/user.types";

interface UserFormProps {
  onSubmit: (data: InviteUserData) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export default function UserForm({
  onSubmit,
  loading = false,
  onCancel,
}: UserFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!fullName.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
      });

      setFullName("");
      setEmail("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la invitación.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Nombre
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          placeholder="Nombre del empleado"
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="empleado@email.com"
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Enviando..."
            : "Enviar invitación"}
        </button>
      </div>
    </form>
  );
}