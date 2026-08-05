import type { ReactNode } from "react";

interface Props {

  children: ReactNode;

  className?: string;

  hover?: boolean;

  padding?: boolean;

}

export default function Card({

  children,

  className = "",

  hover = false,

  padding=true,

}: Props) {

  return (

    <div

      className={`

        rounded-[var(--radius-card)]

        border-[var(--color-border)]

        bg-[var(--color-card)]

        shadow-[var(--shadow-card)]

        transition-all

        ${hover ? "hover:shadow-md" : ""}

        ${className}

        ${padding ? "p-6" : ""}

      `}

    >

      {children}

    </div>

  );

}