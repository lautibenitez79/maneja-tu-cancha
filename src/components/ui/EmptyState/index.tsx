import type { ReactNode } from "react";

interface Props {

  title: string;

  description: string;

  action?: ReactNode;

}

export default function EmptyState({

  title,

  description,

  action,

}: Props) {

  return (

    <div className="rounded-2xl border border-dashed p-12 text-center">

      <h3 className="text-xl font-semibold">

        {title}

      </h3>

      <p className="mt-3 text-slate-500">

        {description}

      </p>

      {action && (

        <div className="mt-6">

          {action}

        </div>

      )}

    </div>

  );

}