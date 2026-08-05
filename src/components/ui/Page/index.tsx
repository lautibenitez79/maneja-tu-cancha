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

      className={`space-y-8 ${className}`}

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