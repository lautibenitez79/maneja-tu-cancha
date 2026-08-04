import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User, Session } from "@supabase/supabase-js";

import { authService } from "../features/auth/services/auth.service";

import { profileService } from "../features/profiles/services/profile.service";

import type { Profile } from "../features/profiles/types/profile.types";

import type {
  RegisterData,
  LoginData,
} from "../features/auth/types/auth.types";

interface AuthContextType {

  user: User | null;

  session: Session | null;

  profile: Profile | null;

  loading: boolean;

  login(data: LoginData): Promise<void>;

  register(data: RegisterData): Promise<void>;

  logout(): Promise<void>;

  refreshProfile(): Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] =
  useState<Profile | null>(null);

  useEffect(() => {

  async function initialize() {

    const currentUser =
      await authService.getUser();

    setUser(currentUser);

    if (currentUser) {
      try {
        const profile =
          await profileService.getProfile(currentUser.id);

        setProfile(profile);
      } catch (error) {
        console.error("No se encontró el perfil", error);
        setProfile(null);
      }

    }

    setLoading(false);

  }

  initialize();

  const {
    data: { subscription },
  } = authService.onAuthStateChange(async (_event, session) => {
  try {
    setSession(session);

    const currentUser = session?.user ?? null;

    setUser(currentUser);

    if (currentUser) {
      const profile = await profileService.getProfile(currentUser.id);
      setProfile(profile);
    } else {
      setProfile(null);
    }
  } catch (error) {
    console.error(error);
    setProfile(null);
  } finally {
    setLoading(false);
  }
});

  return () => subscription.unsubscribe();

}, []);

async function login(
  data: LoginData
) {
  await authService.signIn(data);
}

async function register(
  data: RegisterData
) {
  await authService.signUp(data);
}

  async function logout() {
    await authService.signOut();
  }

  async function refreshProfile() {

  if (!user) {

    setProfile(null);

    return;

  }

  try {

    const profile =
      await profileService.getProfile(user.id);

    setProfile(profile);

  } catch (error) {

    console.error(error);

  }

}

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}