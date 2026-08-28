import type {
  ReactNode,
  ButtonHTMLAttributes,
} from "react";

import clsx from "clsx";

interface Props
  extends ButtonHTMLAttributes<
    HTMLButtonElement
  > {

  variant?:
    | "primary"
    | "secondary"
    | "danger";

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

  ...props

}: Props) {

  return (

    <button

      {...props}

      disabled={
        disabled || loading
      }

      className={clsx(

        "rounded-xl px-5 py-3 font-medium transition",

        {

          "bg-[var(--color-primary)] text-primary-foreground hover:bg-[var(--color-primary-hover)]":
            variant === "primary",

          "border bg-[var(--color-card)]":
            variant === "secondary",

          "bg-red-600 text-white hover:bg-red-700":
            variant === "danger",

          "opacity-50":
            disabled || loading,

        },

        className

      )}

    >

      {

        loading

          ? "Cargando..."

          : children

      }

    </button>

  );

}