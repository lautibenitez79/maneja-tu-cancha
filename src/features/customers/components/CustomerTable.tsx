import Button from "@/components/ui/Button/index";

import type {
  Customer,
} from "../types/customer.types";

interface Props {

  customers: Customer[];

  onEdit(customer: Customer): void;

  onDelete(customer: Customer): void;

}

export default function CustomerTable({

  customers,

  onEdit,

  onDelete,

}: Props) {

  return (

    <div className="overflow-hidden rounded-[var(--radius-card)] border">

      <table className="w-full">

        <thead className="bg-[var(--color-hover)]">

          <tr>

            <th className="px-5 py-4 text-left">

              Nombre

            </th>

            <th className="px-5 py-4 text-left">

              Teléfono

            </th>

            <th className="px-5 py-4 text-left">

              Email

            </th>

            <th className="px-5 py-4">

            </th>

          </tr>

        </thead>

        <tbody>

          {

            customers.map(customer=>(

              <tr
                key={customer.id}
                className="border-t"
              >

                <td className="px-5 py-4">

                  {customer.full_name}

                </td>

                <td className="px-5 py-4">

                  {customer.phone}

                </td>

                <td className="px-5 py-4">

                  {customer.email}

                </td>

                <td className="px-5 py-4">

                  <div className="flex justify-end gap-2">

                    <Button

                      variant="secondary"

                      onClick={()=>

                        onEdit(customer)

                      }

                    >

                      Editar

                    </Button>

                    <Button

                      variant="danger"

                      onClick={()=>

                        onDelete(customer)

                      }

                    >

                      Eliminar

                    </Button>

                  </div>

                </td>

              </tr>

            ))

          }

        </tbody>

      </table>

    </div>

  );

}