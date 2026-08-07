import Card from "@/components/ui/Card/index";
import Button from "@/components/ui/Button/index";

import type {
  Customer,
} from "../types/customer.types";

interface Props {

  customer: Customer;

  onEdit(id: string): void;

  onDelete(id: string): void;

}

export default function CustomerCard({

  customer,

  onEdit,

  onDelete,

}: Props) {

  return (

    <Card>

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-semibold">

            {customer.full_name}

          </h2>

          <p className="text-sm text-[var(--color-text)]">

            {customer.phone}

          </p>

          {

            customer.email && (

              <p className="text-sm text-[var(--color-text)]">

                {customer.email}

              </p>

            )

          }

        </div>

        <div className="flex gap-3">

          <Button

            variant="secondary"

            onClick={()=>

              onEdit(customer.id)

            }

          >

            Editar

          </Button>

          <Button

            variant="danger"

            onClick={()=>

              onDelete(customer.id)

            }

          >

            Eliminar

          </Button>

        </div>

      </div>

    </Card>

  );

}