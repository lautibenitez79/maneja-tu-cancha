import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { clubService } from "../services/club.service";

export default function CreateClubWizard() {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;
    if (!user) return;

    if (!name.trim()) {
      setError("Ingresá el nombre del complejo.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await clubService.createFirstClub(user.id, {
        name: name.trim(),
        phone: "",
        email: user.email ?? "",
        address: "",
        city: "",
        province: "",
        country: "Argentina",
        timezone: "America/Argentina/Buenos_Aires",
        currency: "ARS",
      });

      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el complejo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-md">
      <h1 className="text-2xl font-bold">
        Bienvenido 👋
      </h1>

      <p className="mt-2 text-[var(--color-muted)]">
        Antes de comenzar, creemos tu primer complejo.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <input
          className="w-full rounded border p-3"
          placeholder="Nombre del complejo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[var(--color-primary)] p-3 text-white disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear complejo"}
        </button>
      </form>
    </div>
  );
}