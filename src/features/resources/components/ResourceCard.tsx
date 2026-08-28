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
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">
            {resource.name}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {typeLabels[resource.type]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-y py-4">
          <div>
            <p className="text-xs text-slate-500">
              Precio
            </p>

            <p className="mt-1 font-semibold">
              ${resource.price.toLocaleString("es-AR")}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Seña
            </p>

            <p className="mt-1 font-semibold">
              ${resource.deposit_amount.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onEdit}
            className="w-full sm:w-auto"
          >
            Editar
          </Button>

          <Button
            variant="danger"
            onClick={onDelete}
            className="w-full sm:w-auto"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}