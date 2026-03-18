export type UserRole = "provider" | "consumer" | "both";

export type ModuleKey = "lapak" | "sewa" | "warga" | "hajat";

export type SubscriptionTier = "free" | "starter" | "pro";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  active_modules: ModuleKey[];
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  ktp_photo: string | null;
  tags: string[];
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ConnectionStatus = "active" | "archived" | "pending";
export type ConnectionType = "customer" | "tenant" | "member" | "guest";
export type ArchivedBy = "consumer" | "provider" | "system";

export interface ConsumerConnection {
  id: string;
  consumer_id: string;
  provider_id: string;
  module: ModuleKey;
  connection_type: ConnectionType;
  reference_id: string | null;
  connection_code: string | null;
  status: ConnectionStatus;
  connected_at: string;
  archived_at: string | null;
  archived_by: ArchivedBy | null;
  archive_reason: string | null;
  auto_archive_at: string | null;
  notes: string | null;
}
