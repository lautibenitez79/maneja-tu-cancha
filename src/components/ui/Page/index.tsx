import type { ReactNode } from "react";

import PageHeader from "../PageHeader";

interface Props {
  title: string;

  subtitle?: string;

  action?: ReactNode;

  children: ReactNode;

  className?: string;
}

export default function Page({
  title,
  subtitle,
  action,
  children,
  className = "",
}: Props) {
  return (
    <main
      className={`w-full min-w-0 space-y-8 ${className}`}
    >
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={action}
      />

      {children}
    </main>
  );
}