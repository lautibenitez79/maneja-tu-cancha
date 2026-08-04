import type {
  TextareaHTMLAttributes,
} from "react";

interface Props
  extends TextareaHTMLAttributes<
    HTMLTextAreaElement
  > {}

export default function Textarea({

  className = "",

  ...props

}: Props) {

  return (

    <textarea

      {...props}

      className={`
        w-full

        rounded-[var(--radius-input)]

        border

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