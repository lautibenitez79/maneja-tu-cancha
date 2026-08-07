import { useState, useEffect } from "react";

import Button from "@/components/ui/Button/index";
import Input from "@/components/ui/Input/index";

import type {
  Customer,
  CreateCustomerForm,
} from "../types/customer.types";

interface Props {

  customer?: Customer | null;

  loading?: boolean;

  onSubmit(
    values: CreateCustomerForm,
  ): void;

}

export default function CustomerForm({

  customer,

  loading,

  onSubmit,

}: Props) {

  const [form, setForm] =
    useState<CreateCustomerForm>({

      full_name: "",

      phone: "",

      email: "",

      notes: "",

    });

  useEffect(()=>{

    if(!customer) return;

    setForm({

      full_name: customer.full_name,

      phone: customer.phone,

      email: customer.email ?? "",

      notes: customer.notes ?? "",

    });

  },[customer]);

  function update(

    key:keyof CreateCustomerForm,

    value:string,

  ){

    setForm(prev=>({

      ...prev,

      [key]:value,

    }));

  }

  return(

    <div className="space-y-5">

      <Input

        placeholder="Nombre completo"

        value={form.full_name}

        onChange={e=>

          update("full_name",e.target.value)

        }

      />

      <Input

        placeholder="Teléfono"

        value={form.phone}

        onChange={e=>

          update("phone",e.target.value)

        }

      />

      <Input

        placeholder="Email"

        value={form.email}

        onChange={e=>

          update("email",e.target.value)

        }

      />

      <Input

        placeholder="Notas"

        value={form.notes}

        onChange={e=>

          update("notes",e.target.value)

        }

      />

      <Button

        loading={loading}

        onClick={()=>onSubmit(form)}

      >

        Guardar

      </Button>

    </div>

  );

}