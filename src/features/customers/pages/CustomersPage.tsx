import { useState } from "react";

import Page from "@/components/ui/Page";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button/index";
import SearchInput from "@/components/ui/SearchInput";

import { useCustomers } from "../hooks/useCustomers";

import CustomerTable from "../components/CustomerTable";
import CustomerModal from "../components/CustomerModal";

import type {
  Customer,
  CreateCustomerForm,
} from "../types/customer.types";

export default function CustomersPage() {

  const {

    customers,

    loading,

    refresh,

  } = useCustomers();

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  if (loading) {

    return <Loading />;

  }

  async function handleSubmit(
    values: CreateCustomerForm,
  ) {

    console.log(values);

    setOpen(false);

    setSelectedCustomer(null);

    refresh();

  }

  return (

    <Page

      title="Clientes"

      subtitle="Administrá todos los clientes."

    >

      <div className="flex items-center justify-between gap-4">

        <div className="w-full max-w-md">

          <SearchInput

            value={search}

            onChange={setSearch}

            placeholder="Buscar cliente..."

          />

        </div>

        <Button

          onClick={() => {

            setSelectedCustomer(null);

            setOpen(true);

          }}

        >

          Nuevo Cliente

        </Button>

      </div>

      {

        customers.length === 0 ? (

          <EmptyState

            title="Todavía no hay clientes"

            description="Creá el primer cliente del complejo."

          />

        ) : (

          <CustomerTable

            customers={customers}

            onEdit={(customer) => {

              setSelectedCustomer(customer);

              setOpen(true);

            }}

            onDelete={(customer) => {

              console.log(customer);

            }}

          />

        )

      }

      <CustomerModal

        open={open}

        customer={selectedCustomer}

        onClose={() => {

          setOpen(false);

          setSelectedCustomer(null);

        }}

        onSubmit={handleSubmit}

      />

    </Page>

  );

}