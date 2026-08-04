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

          "bg-[var(--color-primary)] text-white hover:bg-blue-700":
            variant === "primary",

          "border bg-white":
            variant === "secondary",

          "bg-red-600 text-white":
            variant === "primary",

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