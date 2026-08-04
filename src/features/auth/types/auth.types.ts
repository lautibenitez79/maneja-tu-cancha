import type { Session, User } from "@supabase/supabase-js";

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  club_name: string | null;
  avatar_url: string | null;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;

  login(data: LoginData): Promise<void>;

  register(data: RegisterData): Promise<void>;

  loginWithGoogle(): Promise<void>;

  logout(): Promise<void>;

  refreshProfile(): Promise<void>;
}