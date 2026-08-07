import { supabase } from "@/lib/supabase";

import type {
  Customer,
  CreateCustomerForm,
} from "../types/customer.types";

class CustomerService {

  async list(
    clubId: string,
  ): Promise<Customer[]> {

    const { data, error } =
      await supabase

        .from("customers")

        .select("*")

        .eq("club_id", clubId)

        .eq("active", true)

        .order("full_name");

    if (error) {
      throw error;
    }

    return data;
  }

  async getById(
    id: string,
  ): Promise<Customer> {

    const { data, error } =
      await supabase

        .from("customers")

        .select("*")

        .eq("id", id)

        .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async create(
    clubId: string,
    form: CreateCustomerForm,
  ) {

    const { data, error } =
      await supabase

        .from("customers")

        .insert({
          club_id: clubId,
          ...form,
        })

        .select()

        .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(
    id: string,
    form: CreateCustomerForm,
  ) {

    const { error } =
      await supabase

        .from("customers")

        .update({

            ...form,

            updated_at: new Date().toISOString(),

        })

        .eq("id", id);

    if (error) {
      throw error;
    }
  }

  async remove(
    id: string,
  ) {

    const { error } =
      await supabase

        .from("customers")

        .update({
          active: false,
        })

        .eq("id", id);

    if (error) {
      throw error;
    }
  }

  async search(

    clubId: string,

    term: string,

): Promise<Customer[]> {

    const { data, error } =
        await supabase

        .from("customers")

        .select("*")

        .eq("club_id", clubId)

        .eq("active", true)

        .or(
            `full_name.ilike.%${term}%,phone.ilike.%${term}%`
        )

        .limit(10);

    if (error) throw error;

    return data;

}

}

export const customerService =
  new CustomerService();