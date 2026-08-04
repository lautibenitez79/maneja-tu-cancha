export interface Club {
  id: string;

  owner_id: string;

  name: string;

  slug: string;

  phone: string | null;

  email: string | null;

  description: string | null;

  logo_url: string | null;

  address: string | null;

  city: string | null;

  province: string | null;

  country: string | null;

  timezone: string;

  currency: string;

  active: boolean;

  created_at: string;

  updated_at: string;
}