import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string,
    clubName: string
  ) => Promise<void>;

  loginGoogle: () => Promise<void>;

  logout: () => Promise<void>;
}