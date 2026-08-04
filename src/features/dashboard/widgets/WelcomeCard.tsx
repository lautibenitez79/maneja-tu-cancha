import Card from "@/components/ui/Card/index";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dashboard_welcome_hidden";

export default function WelcomeCard() {

  const [hidden, setHidden] =
    useState(false);

  useEffect(() => {

    const value =
      localStorage.getItem(STORAGE_KEY);

    setHidden(value === "true");

  }, []);

  function close() {

    localStorage.setItem(
      STORAGE_KEY,
      "true"
    );

    setHidden(true);

  }

  if (hidden) return null;

  return (

    <Card className="relative rounded-[var(--radius-card)] border bg-white p-8 shadow-[var(--shadow-card)]">

      <button
        onClick={close}
        className="absolute right-5 top-5 rounded-lg p-2 hover:bg-slate-100"
      >

        <X size={18} />

      </button>

      <h2 className="text-2xl font-semibold">

        Tu complejo fue creado correctamente 🎉

      </h2>

      <p className="mt-3 text-gray-500">

        Ahora configurá el resto del sistema.

      </p>

    </Card>

  );

}