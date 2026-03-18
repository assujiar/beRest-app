export type OrgType =
  | "rt_rw"
  | "komplek"
  | "mesjid"
  | "pengajian"
  | "klub"
  | "sekolah"
  | "alumni"
  | "other";

export type MemberRole = "admin" | "treasurer" | "member";
export type DuesStatus = "unpaid" | "paid" | "partial" | "exempt";
export type TransactionType = "income" | "expense";

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  type: OrgType;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  contact_id: string | null;
  consumer_id: string | null;
  name: string;
  phone: string | null;
  role: MemberRole;
  member_code: string | null;
  joined_at: string;
}

export interface OrgDues {
  id: string;
  org_id: string;
  member_id: string;
  period: string;
  amount: number;
  status: DuesStatus;
  paid_date: string | null;
  proof_photo: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrgTransaction {
  id: string;
  org_id: string;
  type: TransactionType;
  category: string | null;
  description: string;
  amount: number;
  transaction_date: string;
  proof_photo: string | null;
  donor_name: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  org_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  member_id: string;
  read_at: string;
}

export type FundraisingStatus = "active" | "completed" | "cancelled";

export interface Fundraising {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  target_amount: number;
  collected_amount: number;
  status: FundraisingStatus;
  deadline: string | null;
  created_at: string;
}

export interface DuesConfig {
  id: string;
  org_id: string;
  label: string;
  amount: number;
  period_type: "monthly" | "yearly" | "custom";
  is_active: boolean;
  created_at: string;
}
