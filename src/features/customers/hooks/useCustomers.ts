import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { customerService } from "../services/customer.service";

import type { Customer } from "../types/customer.types";

export function useCustomers() {

  const { profile } = useAuth();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {

    if (!profile?.club_id) return;

    try {

      setLoading(true);

      const data =
        await customerService.list(
          profile.club_id
        );

      setCustomers(data);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    refresh();

  }, [profile]);

  return {

    customers,

    loading,

    refresh,

  };

}