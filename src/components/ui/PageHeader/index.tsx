import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-[var(--color-title)] sm:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-sm text-[var(--color-text)] sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="w-full shrink-0 sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}