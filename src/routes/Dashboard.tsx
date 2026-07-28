import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Settings, ArrowRight } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

// export const Route = createFileRoute("/_authenticated/dashboard")({
//   head: () => ({
//     meta: [
//       { title: "Dashboard — Maneja Tu Cancha" },
//       { name: "description", content: "Tu panel de administración." },
//       { name: "robots", content: "noindex" },
//     ],
//   }),
//   component: Dashboard,
// });

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    full_name: string | null;
    club_name: string | null;
    email: string | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, club_name, email")
        .eq("id", u.user.id)
        .maybeSingle();
      setProfile(
        data ?? {
          full_name: (u.user.user_metadata?.full_name as string) ?? null,
          club_name: (u.user.user_metadata?.club_name as string) ?? null,
          email: u.user.email ?? null,
        },
      );
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </span>
            <span className="text-[15px]">Maneja Tu Cancha</span>
          </Link>
          <button
            onClick={signOut}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-border/70 bg-card p-8 shadow-[var(--shadow-soft)] md:p-12"
        >
          <p className="text-sm font-medium text-primary">Bienvenido 👋</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile?.full_name ?? "Hola"}
          </h1>
          {profile?.club_name && (
            <p className="mt-2 text-muted-foreground">
              Estás administrando{" "}
              <span className="font-medium text-foreground">{profile.club_name}</span>
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]">
              <Settings className="h-4 w-4" /> Comenzar configuración
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/contacto"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium hover:bg-secondary"
            >
              Necesito ayuda
            </Link>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          El CRM completo llega pronto. Por ahora, dejamos la navegación preparada.
        </p>
      </main>
    </div>
  );
}

export default Dashboard;