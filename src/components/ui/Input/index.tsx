import type {
  InputHTMLAttributes,
} from "react";

interface Props
  extends InputHTMLAttributes<
    HTMLInputElement
  > {}

export default function Input({

  className = "",

  ...props

}: Props) {

  return (

    <input

      {...props}

      className={`

        w-full

        rounded-[var(--radius-input)]

        border-[var(--color-border)]

        px-4

        py-3

        outline-none

        transition

        focus:border-[var(--color-primary)]

        ${className}

      `}

    />

  );

}