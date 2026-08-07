import Modal from "@/components/ui/Modal/index";
import CustomerForm from "./CustomerForm";

import type {
  Customer,
  CreateCustomerForm,
} from "../types/customer.types";

interface Props {

  open: boolean;

  customer?: Customer | null;

  loading?: boolean;

  onClose(): void;

  onSubmit(
    values: CreateCustomerForm,
  ): void;

}

export default function CustomerModal({

  open,

  customer,

  loading,

  onClose,

  onSubmit,

}: Props) {

  return (

    <Modal

      open={open}

      title={
        customer
          ? "Editar cliente"
          : "Nuevo cliente"
      }

      onClose={onClose}

    >

      <CustomerForm

        customer={customer}

        loading={loading}

        onSubmit={onSubmit}

      />

    </Modal>

  );

}