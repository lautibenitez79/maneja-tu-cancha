export interface MercadoPagoConnection {
  club_id: string;
  mp_user_id: string;
  token_type: string;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}