import Card from "@/components/ui/Card/index";
import Button from "@/components/ui/Button/index";

import type { Resource } from "../types/resource.types";

interface Props {
  resource: Resource;

  onEdit(): void;

  onDelete(): void;
}

const typeLabels = {
  football: "Fútbol",
  padel: "Pádel",
  tennis: "Tenis",
  basket: "Básquet",
  gym: "Gimnasio",
  room: "Sala",
};

export default function ResourceCard({
  resource,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card hover>

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">

            {resource.name}

          </h2>

          <p className="mt-2 text-sm text-slate-500">

            {typeLabels[resource.type]}

          </p>

        </div>

        <div className="flex gap-3">

          <Button
            variant="secondary"
            onClick={onEdit}
          >
            Editar
          </Button>

          <Button
            variant="danger"
            onClick={onDelete}
          >
            Eliminar
          </Button>

        </div>

      </div>

    </Card>
  );
}