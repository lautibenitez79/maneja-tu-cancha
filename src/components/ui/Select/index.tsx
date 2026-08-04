import type {
  SelectHTMLAttributes,
} from "react";

interface Props
  extends SelectHTMLAttributes<
    HTMLSelectElement
  > {}

export default function Select({

  className = "",

  children,

  ...props

}: Props) {

  return (

    <select

      {...props}

      className={`
        w-full

        rounded-[var(--radius-input)]

        border

        border-[var(--color-border)]

        bg-white

        px-4

        py-3

        outline-none

        transition

        focus:border-[var(--color-primary)]

        ${className}
      `}

    >

      {children}

    </select>

  );

}