import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../features/auth/hooks/useAuth";

import Input from "../components/ui/Input/index";
import Button from "../components/ui/Button/index";

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Ingresá tu email.");
      return;
    }

    try {
      setLoading(true);

      await resetPasswordForEmail(email.trim());

      setSent(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar el email de recuperación.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al ingreso
        </Link>

        <div className="rounded-[var(--radius-card)] border border-border/70 bg-card p-7 shadow-[var(--shadow-soft)]">
          <div className="mb-6 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </span>

            <span className="text-base font-semibold tracking-tight">
              Maneja Tu Cancha
            </span>
          </div>

          {!sent ? (
            <>
              <div className="mb-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">
                  Recuperar contraseña
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                  Ingresá el email asociado a tu cuenta y te
                  enviaremos un enlace para crear una nueva
                  contraseña.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium"
                  >
                    Email
                  </label>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="tu@email.com"
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
                    ? "Enviando..."
                    : "Enviar enlace"}
                </Button>
              </form>
            </>
          ) : (
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Mail className="h-5 w-5" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Revisá tu email
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Si existe una cuenta asociada a ese email,
                recibirás un enlace para restablecer tu
                contraseña.
              </p>

              <p className="mt-4 text-sm text-muted-foreground">
                Revisá también la carpeta de spam o correo no
                deseado.
              </p>

              <Link
                to="/login"
                className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
              >
                Volver a ingresar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}