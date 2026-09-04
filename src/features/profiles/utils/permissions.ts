import type { Profile } from "../types/profile.types";

export function isAdmin(
  profile: Profile | null,
): boolean {
  return profile?.role === "admin";
}

export function isUser(
  profile: Profile | null,
): boolean {
  return profile?.role === "user";
}