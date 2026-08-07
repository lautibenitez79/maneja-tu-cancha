import CustomerCard from "./CustomerCard";

import type {
  Customer,
} from "../types/customer.types";

interface Props {

  customers: Customer[];

  onEdit(id:string):void;

  onDelete(id:string):void;

}

export default function CustomerList({

  customers,

  onEdit,

  onDelete,

}: Props){

  return(

    <div className="space-y-5">

      {

        customers.map(customer=>(

          <CustomerCard

            key={customer.id}

            customer={customer}

            onEdit={onEdit}

            onDelete={onDelete}

          />

        ))

      }

    </div>

  );

}