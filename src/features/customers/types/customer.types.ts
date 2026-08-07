export interface Customer {

  id: string;

  club_id: string;

  full_name: string;

  phone: string;

  email: string | null;

  notes: string | null;

  active: boolean;

  created_at: string;

  updated_at: string;

}

export interface CreateCustomerForm {

  full_name: string;

  phone: string;

  email: string;

  notes: string;

}