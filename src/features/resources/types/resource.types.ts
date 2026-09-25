export type ResourceType =
  | "football"
  | "padel"
  | "tennis"
  | "basket"
  | "gym"
  | "room";

export type ResourceSurface =
  | "synthetic"
  | "floor";

export type FootballFormat =
  | "5"
  | "7"
  | "8"
  | "9"
  | "11";

export interface Resource {
  id: string;

  club_id: string;

  name: string;

  description: string | null;

  type: ResourceType;

  capacity: number;

  reservation_duration: number;

  price: number;
  
  deposit_amount: number;

  // Características
  covered: boolean | null;
  surface: ResourceSurface | null;
  football_format: FootballFormat | null;
  lighting: boolean | null;
  beelup: boolean | null;

  active: boolean;

  created_at: string;

  updated_at: string;
}

export interface CreateResourceForm {
  name: string;

  type: ResourceType;

  capacity: number;

  reservation_duration: number;

  price: number;

  deposit_amount: number;

  // Características
  covered: boolean | null;
  surface: ResourceSurface | null;
  football_format: FootballFormat | null;
  lighting: boolean | null;
  beelup: boolean | null;
}