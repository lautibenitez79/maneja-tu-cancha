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

        rounded-xl

        border

        px-4

        py-3

        outline-none

        transition

        focus:border-blue-600

        ${className}

      `}

    />

  );

}