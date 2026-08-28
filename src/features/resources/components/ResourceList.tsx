import ResourceCard from "./ResourceCard";

import type { Resource } from "../types/resource.types";

interface Props {
  resources: Resource[];

  onDelete(id: string): void;

  onEdit(id: string): void;
}

export default function ResourceList({
  resources,
  onDelete,
  onEdit,
}: Props) {
  if (resources.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center sm:p-10">
        <h2 className="text-xl font-semibold">
          Todavía no tenés recursos
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Creá tu primera cancha o gimnasio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDelete={() => onDelete(resource.id)}
          onEdit={() => onEdit(resource.id)}
        />
      ))}
    </div>
  );
}