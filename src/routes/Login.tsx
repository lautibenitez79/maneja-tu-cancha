import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
// import { supabase } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";

// export const Route = createFileRoute("/login")({
//   head: () => ({
//     meta: [
//       { title: "Ingresar — Maneja Tu Cancha" },
//       {
//         name: "description",
//         content: "Ingresá o registrate para comenzar a administrar tu cancha.",
//       },
//       { property: "og:title", content: "Ingresar — Maneja Tu Cancha" },
//       { property: "og:description", content: "Accedé a tu panel." },
//       { property: "og:url", content: "/login" },
//       { name: "robots", content: "noindex" },
//     ],
//     links: [{ rel: "canonical", href: "/login" }],
//   }),
//   component: LoginPage,
// });

type Mode = "choose" | "signin" | "signup" | "google-club";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("choose");
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate("/dashboard", {replace: true,});
    });
  }, [navigate]);

  // Detect Google sign-in that needs club name
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("club_name")
          .eq("id", session.user.id)
          .maybeSingle();
        if (!profile?.club_name) {
          setMode("google-club");
        } else {
          navigate({ to: "/dashboard", replace: true });
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-border/70 bg-card p-7 shadow-[var(--shadow-soft)]"
        >
          <div className="mb-6 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </span>
            <span className="text-base font-semibold tracking-tight">
              Maneja Tu Cancha
            </span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "choose" && (
              <ChooseView
                key="choose"
                loading={loading}
                setLoading={setLoading}
                onSignup={() => setMode("signup")}
                onSignin={() => setMode("signin")}
              />
            )}
            {mode === "signup" && (
              <SignupView key="signup" onBack={() => setMode("choose")} />
            )}
            {mode === "signin" && (
              <SigninView key="signin" onBack={() => setMode("choose")} />
            )}
            {mode === "google-club" && <GoogleClubView key="gc" />}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function ChooseView({
  loading,
  setLoading,
  onSignup,
  onSignin,
}: {
  loading: boolean;
  setLoading: (v: boolean) => void;
  onSignup: () => void;
  onSignin: () => void;
}) {
  async function google() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      toast.error("No pudimos iniciar sesión con Google.");
      setLoading(false);
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Bienvenido</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresá o creá tu cuenta para empezar.
      </p>

      <button
        onClick={google}
        disabled={loading}
        className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Ingresar con Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        o
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={onSignup}
        className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
      >
        Registrarse con Email
      </button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <button
          onClick={onSignin}
          className="font-medium text-primary hover:underline"
        >
          Ingresar
        </button>
      </p>
    </motion.div>
  );
}

function SignupView({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("full_name") ?? "");
    const email = String(fd.get("email") ?? "");
    const club_name = String(fd.get("club_name") ?? "");
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) return toast.error("Las contraseñas no coinciden.");
    if (password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name, club_name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("¡Cuenta creada!");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <TInput name="full_name" label="Nombre" required />
        <TInput name="email" label="Mail" type="email" required />
        <TInput name="club_name" label="Nombre del club o cancha" required />
        <TInput name="password" label="Contraseña" type="password" required />
        <TInput name="confirm" label="Confirmar contraseña" type="password" required />
        <button
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Crear cuenta
        </button>
      </form>
    </motion.div>
  );
}

function SigninView({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard", replace: true });
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackBtn onBack={onBack} />
      <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <TInput name="email" label="Mail" type="email" required />
        <TInput name="password" label="Contraseña" type="password" required />
        <button
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Ingresar
        </button>
      </form>
    </motion.div>
  );
}

function GoogleClubView() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const club_name = String(fd.get("club_name") ?? "");
    if (!club_name) return;
    setLoading(true);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ club_name })
      .eq("id", userRes.user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard", replace: true });
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 className="text-2xl font-semibold tracking-tight">Un último paso</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Contanos el nombre de tu club o cancha.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <TInput name="club_name" label="Nombre del club o cancha" required />
        <button
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar
        </button>
      </form>
    </motion.div>
  );
}

function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Atrás
    </button>
  );
}

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
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12Z"
      />
    </svg>
  );
}
