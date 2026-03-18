import { supabase } from "./supabase";
import type {
  Organization,
  OrgMember,
  OrgDues,
  OrgTransaction,
  Announcement,
  Fundraising,
  DuesConfig,
  DuesStatus,
  FundraisingStatus,
} from "@app-types/warga.types";

// ==================== ORGANIZATIONS ====================

export async function createOrganization(
  userId: string,
  org: Pick<Organization, "name" | "type" | "description" | "logo_url">
): Promise<Organization> {
  const slug = org.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("organizations")
    .insert({ ...org, user_id: userId, slug })
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

export async function getOrganizations(
  userId: string
): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Organization[];
}

export async function getOrganization(
  id: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Organization;
}

export async function updateOrganization(
  id: string,
  updates: Partial<Pick<Organization, "name" | "description" | "logo_url" | "settings">>
): Promise<Organization> {
  const { data, error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

// ==================== MEMBERS ====================

function generateMemberCode(orgName: string): string {
  const prefix = orgName.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${random}`;
}

export async function addMember(
  orgId: string,
  orgName: string,
  member: Pick<OrgMember, "name" | "phone" | "role" | "contact_id" | "consumer_id">
): Promise<OrgMember> {
  const memberCode = generateMemberCode(orgName);

  const { data, error } = await supabase
    .from("org_members")
    .insert({
      org_id: orgId,
      member_code: memberCode,
      ...member,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrgMember;
}

export async function addMembersBatch(
  orgId: string,
  orgName: string,
  members: Pick<OrgMember, "name" | "phone" | "role">[]
): Promise<OrgMember[]> {
  const rows = members.map((m) => ({
    org_id: orgId,
    member_code: generateMemberCode(orgName),
    contact_id: null,
    consumer_id: null,
    ...m,
  }));

  const { data, error } = await supabase
    .from("org_members")
    .insert(rows)
    .select();

  if (error) throw error;
  return (data ?? []) as OrgMember[];
}

export async function getMembers(orgId: string): Promise<OrgMember[]> {
  const { data, error } = await supabase
    .from("org_members")
    .select("*")
    .eq("org_id", orgId)
    .order("name");

  if (error) throw error;
  return (data ?? []) as OrgMember[];
}

export async function updateMember(
  id: string,
  updates: Partial<Pick<OrgMember, "name" | "phone" | "role">>
): Promise<OrgMember> {
  const { data, error } = await supabase
    .from("org_members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OrgMember;
}

export async function removeMember(id: string): Promise<void> {
  const { error } = await supabase.from("org_members").delete().eq("id", id);
  if (error) throw error;
}

// ==================== DUES CONFIG ====================

export async function setDuesConfig(
  orgId: string,
  config: Pick<DuesConfig, "label" | "amount" | "period_type">
): Promise<DuesConfig> {
  // Deactivate existing
  await supabase
    .from("dues_configs")
    .update({ is_active: false })
    .eq("org_id", orgId);

  const { data, error } = await supabase
    .from("dues_configs")
    .insert({ org_id: orgId, is_active: true, ...config })
    .select()
    .single();

  if (error) throw error;
  return data as DuesConfig;
}

export async function getActiveDuesConfig(
  orgId: string
): Promise<DuesConfig | null> {
  const { data, error } = await supabase
    .from("dues_configs")
    .select("*")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as DuesConfig;
}

// ==================== DUES TRACKING ====================

export async function getDuesByPeriod(
  orgId: string,
  period: string
): Promise<OrgDues[]> {
  const { data, error } = await supabase
    .from("org_dues")
    .select("*, org_members(name, phone)")
    .eq("org_id", orgId)
    .eq("period", period)
    .order("created_at");

  if (error) throw error;
  return (data ?? []) as OrgDues[];
}

export async function generateDuesForPeriod(
  orgId: string,
  period: string,
  amount: number
): Promise<OrgDues[]> {
  const members = await getMembers(orgId);

  const rows = members.map((m) => ({
    org_id: orgId,
    member_id: m.id,
    period,
    amount,
    status: "unpaid" as DuesStatus,
  }));

  const { data, error } = await supabase
    .from("org_dues")
    .insert(rows)
    .select();

  if (error) throw error;
  return (data ?? []) as OrgDues[];
}

export async function updateDuesStatus(
  id: string,
  status: DuesStatus,
  proofPhoto?: string
): Promise<OrgDues> {
  const updates: Record<string, unknown> = { status };
  if (status === "paid") {
    updates.paid_date = new Date().toISOString();
  }
  if (proofPhoto) {
    updates.proof_photo = proofPhoto;
  }

  const { data, error } = await supabase
    .from("org_dues")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OrgDues;
}

export async function getUnpaidMembers(
  orgId: string,
  period: string
): Promise<OrgDues[]> {
  const { data, error } = await supabase
    .from("org_dues")
    .select("*, org_members(name, phone)")
    .eq("org_id", orgId)
    .eq("period", period)
    .eq("status", "unpaid");

  if (error) throw error;
  return (data ?? []) as OrgDues[];
}

// ==================== TRANSACTIONS ====================

export async function addTransaction(
  orgId: string,
  tx: Pick<
    OrgTransaction,
    "type" | "category" | "description" | "amount" | "transaction_date" | "proof_photo" | "donor_name"
  >
): Promise<OrgTransaction> {
  const { data, error } = await supabase
    .from("org_transactions")
    .insert({ org_id: orgId, ...tx })
    .select()
    .single();

  if (error) throw error;
  return data as OrgTransaction;
}

export async function getTransactions(
  orgId: string,
  limit = 50
): Promise<OrgTransaction[]> {
  const { data, error } = await supabase
    .from("org_transactions")
    .select("*")
    .eq("org_id", orgId)
    .order("transaction_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as OrgTransaction[];
}

export async function getFinancialSummary(
  orgId: string
): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
  const { data, error } = await supabase
    .from("org_transactions")
    .select("type, amount")
    .eq("org_id", orgId);

  if (error) throw error;

  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of data ?? []) {
    if (row.type === "income") totalIncome += row.amount;
    else totalExpense += row.amount;
  }

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

// ==================== ANNOUNCEMENTS ====================

export async function createAnnouncement(
  orgId: string,
  announcement: Pick<Announcement, "title" | "body" | "is_pinned">
): Promise<Announcement> {
  const { data, error } = await supabase
    .from("announcements")
    .insert({ org_id: orgId, ...announcement })
    .select()
    .single();

  if (error) throw error;
  return data as Announcement;
}

export async function getAnnouncements(
  orgId: string
): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("org_id", orgId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Announcement[];
}

export async function markAnnouncementRead(
  announcementId: string,
  memberId: string
): Promise<void> {
  await supabase.from("announcement_reads").upsert({
    announcement_id: announcementId,
    member_id: memberId,
    read_at: new Date().toISOString(),
  });
}

export async function getAnnouncementReadCount(
  announcementId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("announcement_reads")
    .select("*", { count: "exact", head: true })
    .eq("announcement_id", announcementId);

  if (error) return 0;
  return count ?? 0;
}

// ==================== FUNDRAISING ====================

export async function createFundraising(
  orgId: string,
  fund: Pick<Fundraising, "title" | "description" | "target_amount" | "deadline">
): Promise<Fundraising> {
  const { data, error } = await supabase
    .from("fundraisings")
    .insert({
      org_id: orgId,
      collected_amount: 0,
      status: "active" as FundraisingStatus,
      ...fund,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Fundraising;
}

export async function getFundraisings(
  orgId: string
): Promise<Fundraising[]> {
  const { data, error } = await supabase
    .from("fundraisings")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Fundraising[];
}

export async function addDonation(
  fundraisingId: string,
  amount: number,
  donorName: string,
  orgId: string
): Promise<void> {
  // Update collected amount
  const { data: fund } = await supabase
    .from("fundraisings")
    .select("collected_amount, target_amount")
    .eq("id", fundraisingId)
    .single();

  if (!fund) throw new Error("Fundraising tidak ditemukan");

  const newAmount = fund.collected_amount + amount;

  await supabase
    .from("fundraisings")
    .update({
      collected_amount: newAmount,
      status:
        newAmount >= fund.target_amount
          ? ("completed" as FundraisingStatus)
          : ("active" as FundraisingStatus),
    })
    .eq("id", fundraisingId);

  // Record as income transaction
  await addTransaction(orgId, {
    type: "income",
    category: "infaq",
    description: `Infaq: ${donorName}`,
    amount,
    transaction_date: new Date().toISOString(),
    proof_photo: null,
    donor_name: donorName,
  });
}
