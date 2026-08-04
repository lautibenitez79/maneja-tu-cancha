export interface WorkingHour {
  id: string;

  resource_id: string;

  day_of_week: number;

  enabled: boolean;

  opens_at: string;

  closes_at: string;
  
  reopens_at: string | null;

  final_closes_at: string | null;
}

export interface WorkingHourForm {
  day_of_week: number;

  enabled: boolean;

  opens_at: string;

  closes_at: string;

  reopens_at: string | null;

  final_closes_at: string | null;
}