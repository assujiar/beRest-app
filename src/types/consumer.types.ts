import type { ModuleKey } from "./shared.types";

export type NotificationType =
  | "order_update"
  | "payment_due"
  | "announcement"
  | "rsvp_reminder"
  | "schedule_reminder";

export interface Notification {
  id: string;
  user_id: string;
  provider_id: string | null;
  module: ModuleKey;
  type: NotificationType;
  title: string;
  body: string | null;
  reference_type: string | null;
  reference_id: string | null;
  deep_link: string | null;
  is_read: boolean;
  created_at: string;
}
