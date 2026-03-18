export type EventType =
  | "nikah"
  | "khitan"
  | "aqiqah"
  | "ultah"
  | "syukuran"
  | "duka"
  | "custom";

export type EventStatus = "draft" | "published" | "completed";
export type RsvpStatus = "pending" | "attending" | "not_attending" | "maybe";
export type GiftDirection = "given" | "received";

export interface HajatEvent {
  id: string;
  user_id: string;
  title: string;
  type: EventType;
  slug: string | null;
  event_date: string;
  event_time: string | null;
  location_name: string | null;
  location_address: string | null;
  location_maps_url: string | null;
  template_id: string | null;
  custom_message: string | null;
  cover_photo: string | null;
  settings: Record<string, unknown>;
  status: EventStatus;
  created_at: string;
}

export interface EventGuest {
  id: string;
  event_id: string;
  contact_id: string | null;
  consumer_id: string | null;
  name: string;
  phone: string | null;
  guest_code: string | null;
  invitation_sent: boolean;
  invitation_opened: boolean;
  rsvp_status: RsvpStatus;
  rsvp_count: number;
  checked_in: boolean;
  notes: string | null;
  created_at: string;
}

export interface GiftRecord {
  id: string;
  user_id: string;
  contact_id: string | null;
  person_name: string;
  direction: GiftDirection;
  amount: number | null;
  event_type: string | null;
  event_description: string | null;
  event_date: string | null;
  notes: string | null;
  created_at: string;
}
