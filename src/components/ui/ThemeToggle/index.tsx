import {
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

import {
  useTheme,
} from "../../../contexts/ThemeContext";

export default function ThemeToggle() {
  const {
    theme,

    setTheme,
  } = useTheme();

  return (
    <div className="flex overflow-hidden rounded-xl border">

      <button
        onClick={() =>
          setTheme("light")
        }
        className={`flex items-center gap-2 px-3 py-2 transition ${
          theme === "light"
            ? "bg-blue-600 text-white"
            : ""
        }`}
      >
        <Sun size={16} />

        Claro
      </button>

      <button
        onClick={() =>
          setTheme("dark")
        }
        className={`flex items-center gap-2 px-3 py-2 transition ${
          theme === "dark"
            ? "bg-blue-600 text-white"
            : ""
        }`}
      >
        <Moon size={16} />

        Oscuro
      </button>

      <button
        onClick={() =>
          setTheme("system")
        }
        className={`flex items-center gap-2 px-3 py-2 transition ${
          theme === "system"
            ? "bg-blue-600 text-white"
            : ""
        }`}
      >
        <Monitor size={16} />

        Sistema
      </button>

    </div>
  );
}