import type {
  ReactNode,
  ButtonHTMLAttributes,
} from "react";

import clsx from "clsx";

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  loading?: boolean;
}

export default function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition",
        "whitespace-nowrap",
        {
          "bg-[var(--color-primary)] text-primary-foreground hover:bg-[var(--color-primary-hover)]":
            variant === "primary",

          "border bg-[var(--color-card)] hover:bg-[var(--color-hover)]":
            variant === "secondary",

          "bg-red-600 text-white hover:bg-red-700":
            variant === "danger",

          "cursor-not-allowed opacity-50":
            disabled || loading,
        },
        className,
      )}
    >
      {loading ? (
        "Cargando..."
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}