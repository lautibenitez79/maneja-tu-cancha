import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />

      <h2 className="mt-6 text-xl font-semibold">
        Cargando...
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Preparando tu panel
      </p>
    </div>
  );
}