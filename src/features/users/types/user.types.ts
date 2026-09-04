export interface ClubUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  club_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InviteUserData {
  fullName: string;
  email: string;
}