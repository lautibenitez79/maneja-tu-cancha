export interface Profile {
  id: string;

  email: string;

  full_name: string | null;

  avatar_url: string | null;

  provider: string;

  club_id: string | null;

  created_at: string;

  updated_at: string;
}