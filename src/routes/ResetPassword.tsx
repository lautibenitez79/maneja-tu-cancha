import { useState } from "react";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../features/auth/hooks/useAuth";

import Input from "../components/ui/Input/index";
import Button from "../components/ui/Button/index";

export default function ResetPassword() {
  const navigate = useNavigate();

  const {
    updatePassword,
  } = useAuth();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (password.length < 6) {
      toast.error(
        "La contraseña debe tener al menos 6 caracteres.",
      );

      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        "Las contraseñas no coinciden.",
      );

      return;
    }

    try {
      setLoading(true);

      await updatePassword(password);

      toast.success(
        "Contraseña actualizada correctamente.",
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <div className="rounded-[var(--radius-card)] border border-border/70 bg-card p-7 shadow-[var(--shadow-soft)]">

          <div className="mb-6 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">
                M
              </span>
            </span>

            <span className="text-base font-semibold tracking-tight">
              Maneja Tu Cancha
            </span>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Nueva contraseña
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Elegí una nueva contraseña para
              volver a acceder a tu cuenta.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
              >
                Nueva contraseña
              </label>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                required
                disabled={loading}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1 block text-sm font-medium"
              >
                Confirmar contraseña
              </label>

              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                required
                disabled={loading}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Actualizando..."
                : "Cambiar contraseña"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}