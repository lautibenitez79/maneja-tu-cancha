import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

interface ThemeContextType {
  theme: ThemeMode;

  resolvedTheme:
    | "light"
    | "dark";

  setTheme(
    theme: ThemeMode
  ): void;

  toggleTheme(): void;
}

const ThemeContext =
  createContext(
    {} as ThemeContextType
  );

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] =
    useState<ThemeMode>(() => {
      const saved =
        localStorage.getItem(
          "theme"
        ) as ThemeMode | null;

      return saved ?? "system";
    });

  const prefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

  const resolvedTheme =
    useMemo(() => {
      if (theme === "system") {
        return prefersDark.matches
          ? "dark"
          : "light";
      }

      return theme;
    }, [
      theme,
      prefersDark.matches,
    ]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      resolvedTheme === "dark"
    );

    localStorage.setItem(
      "theme",
      theme
    );
  }, [
    theme,
    resolvedTheme,
  ]);

  useEffect(() => {
    const listener = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle(
          "dark",
          prefersDark.matches
        );
      }
    };

    prefersDark.addEventListener(
      "change",
      listener
    );

    return () =>
      prefersDark.removeEventListener(
        "change",
        listener
      );
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => {
      if (prev === "light")
        return "dark";

      if (prev === "dark")
        return "system";

      return "light";
    });
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,

        resolvedTheme,

        setTheme,

        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(
    ThemeContext
  );
}