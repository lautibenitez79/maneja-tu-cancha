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
  padding = true,
}: Props) {
  return (
    <div
      className={`
        w-full
        min-w-0
        rounded-[var(--radius-card)]
        border
        border-[var(--color-border)]
        bg-[var(--color-card)]
        shadow-[var(--shadow-card)]
        transition-all
        ${hover ? "hover:shadow-md" : ""}
        ${className}
        ${padding ? "p-5 sm:p-6" : ""}
      `}
    >
      {children}
    </div>
  );
}