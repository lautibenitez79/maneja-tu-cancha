import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input/index";
import Button from "../components/ui/Button/index";

type Mode = "signin" | "signup";

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");

  useEffect(() => {
    if (user) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        {/* Atrás fuera del formulario */}
        {mode === "signup" && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-3"
          >
            <Button
              type="button"
              onClick={() => setMode("signin")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[var(--radius-card)] border border-border/70 bg-card p-7 shadow-[var(--shadow-soft)]"
        >
          {/* Branding */}
          <div className="mb-6 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </span>

            <span className="text-base font-semibold tracking-tight">
              Maneja Tu Cancha
            </span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "signin" && (
              <SigninView
                key="signin"
                onSignup={() => setMode("signup")}
              />
            )}

            {mode === "signup" && (
              <SignupView key="signup" />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function SigninView({ onSignup }: { onSignup: () => void }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    try {
      setLoading(true);

      await login({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.message || "No pudimos iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      setGoogleLoading(true);

      await loginWithGoogle();
    } catch (error) {
      console.error(error);

      toast.error("No pudimos iniciar sesión con Google.");

      setGoogleLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">
        Ingresar
      </h1>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <TInput
          name="email"
          label="Mail"
          type="email"
          required
        />

        <TInput
          name="password"
          label="Contraseña"
          type="password"
          required
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          Ingresar
        </Button>
      </form>

      {/* Google - LOGIN */}
      <Button
        type="button"
        onClick={google}
        disabled={googleLoading}
        className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
      >
        <GoogleIcon />

        {googleLoading
          ? "Conectando..."
          : "Ingresar con Google"}
      </Button>

      <Divider />

      {/* REGISTRO */}
      <div className="text-center">
        <p className="mb-3 text-sm text-muted-foreground">
          ¿No tenés cuenta?
        </p>

        <div className="flex flex-row gap-4">
          <Button
            type="button"
            onClick={onSignup}
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
          >
            Registrarse con Email
          </Button>

          <GoogleSignupButton />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   REGISTRO
========================================================= */

function SignupView() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const fullName = String(fd.get("full_name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(
      fd.get("confirm") ?? ""
    );

    /* Validación de contraseñas */
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await register({
        email,
        password,
        fullName,
      });

      toast.success("Cuenta creada");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.message || "No pudimos crear la cuenta."
      );
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      setGoogleLoading(true);

      await loginWithGoogle();
    } catch (error) {
      console.error(error);

      toast.error("No pudimos registrarte con Google.");

      setGoogleLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">
        Crear cuenta
      </h1>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <TInput
          name="full_name"
          label="Nombre"
          required
        />

        <TInput
          name="email"
          label="Mail"
          type="email"
          required
        />

        <TInput
          name="password"
          label="Contraseña"
          type="password"
          required
        />

        <TInput
          name="confirm"
          label="Confirmar contraseña"
          type="password"
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          Crear cuenta
        </Button>
      </form>

      <Divider />

      <Button
        type="button"
        onClick={google}
        disabled={googleLoading}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
      >
        <GoogleIcon />

        {googleLoading
          ? "Conectando..."
          : "Registrarse con Google"}
      </Button>
    </motion.div>
  );
}

/* =========================================================
   GOOGLE SIGNUP
========================================================= */

function GoogleSignupButton() {
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useAuth();

  async function google() {
    try {
      setLoading(true);

      await loginWithGoogle();
    } catch (error) {
      console.error(error);

      toast.error("No pudimos registrarte con Google.");

      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={google}
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
    >
      <GoogleIcon />

      {loading
        ? "Conectando..."
        : "Registrarse con Google"}
    </Button>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      o
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function TInput({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
      </label>

      <Input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="-3 0 262 262"
      preserveAspectRatio="xMidYMid"
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  );
}

export default LoginPage;