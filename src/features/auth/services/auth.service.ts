import { supabase } from "../../../lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import type { RegisterData, LoginData } from "../types/auth.types";

export const authService = {
  async signUp(data: RegisterData) {
    const { data: response, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error) throw error;

    return response;
  },

  async signIn(data: LoginData) {
    const { error, data: response } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return response;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  async getUser() {
    const { data } = await supabase.auth.getUser();

    return data.user;
  },

  async resetPasswordForEmail(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw error;
    }
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }
  },
  async signInWithGoogle() {
  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });

  if (error) {
    throw error;
  }

  return data;
},

  onAuthStateChange(
    callback: (
      event: AuthChangeEvent,
      session: Session | null,
    ) => void | Promise<void>,
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
