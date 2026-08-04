export type ResourceType =
  | "football"
  | "padel"
  | "tennis"
  | "basket"
  | "gym"
  | "room";

export interface Resource {
  id: string;

  club_id: string;

  name: string;

  type: ResourceType;

  capacity: number;

  reservation_duration: number;

  active: boolean;

  created_at: string;

  updated_at: string;
}

export interface CreateResourceForm {
  name: string;

  type: ResourceType;

  capacity: number;

  reservation_duration: number;
}

