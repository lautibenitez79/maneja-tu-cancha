export interface MercadoPagoConnection {
  id: string;
  club_id: string;
  mp_user_id: string;
  public_key: string | null;
  live_mode: boolean;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}