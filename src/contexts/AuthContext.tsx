import { createContext, useEffect, useState, type ReactNode } from "react";

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

  loginWithGoogle(): Promise<void>;

  register(data: RegisterData): Promise<void>;

  logout(): Promise<void>;

  refreshProfile(): Promise<void>;

  resetPasswordForEmail(email: string): Promise<void>;

  updatePassword(password: string): Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [session, setSession] = useState<Session | null>(null);

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
  let mounted = true;

  async function initialize() {
    try {
      const currentSession = await authService.getSession();

      if (!mounted) return;

      setSession(currentSession);

      const currentUser = currentSession?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        try {
          const profile = await profileService.getProfile(currentUser.id);

          if (!mounted) return;

          setProfile(profile);
        } catch (error) {
          console.error("No se encontró el perfil", error);

          if (mounted) {
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error(
        "Error inicializando autenticación:",
        error,
      );

      if (mounted) {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  initialize();

  const {
    data: { subscription },
  } = authService.onAuthStateChange(
    async (_event, session) => {
      if (!mounted) return;

      setSession(session);

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      try {
        const profile =
          await profileService.getProfile(currentUser.id);

        if (mounted) {
          setProfile(profile);
        }
      } catch (error) {
        console.error(
          "No se encontró el perfil",
          error,
        );

        if (mounted) {
          setProfile(null);
        }
      }
    },
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  async function login(data: LoginData) {
    await authService.signIn(data);
  }

  async function register(data: RegisterData) {
    await authService.signUp(data);
  }

  async function logout() {
    await authService.signOut();
  }

  async function resetPasswordForEmail(email: string) {
    await authService.resetPasswordForEmail(email);
  }

  async function updatePassword(password: string) {
    await authService.updatePassword(password);
  }

  async function refreshProfile() {
    if (!user) {
      setProfile(null);

      return;
    }

    try {
      const profile = await profileService.getProfile(user.id);

      setProfile(profile);
    } catch (error) {
      console.error(error);
    }
  }

  async function loginWithGoogle() {
    await authService.signInWithGoogle();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
