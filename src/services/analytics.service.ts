import { supabase } from "./supabase";
import { formatRupiah } from "@utils/format";
import type { ModuleKey } from "@app-types/shared.types";

// ==================== TYPES ====================

export interface AnalyticsSummary {
  module: ModuleKey;
  label: string;
  metrics: AnalyticsMetric[];
}

export interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  formatted: string;
  trend?: "up" | "down" | "flat";
  trendPercent?: number;
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
}

// ==================== LAPAK ANALYTICS ====================

export async function getLapakAnalytics(
  userId: string,
  days = 30
): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  const prevSince = new Date();
  prevSince.setDate(prevSince.getDate() - days * 2);
  const prevSinceStr = prevSince.toISOString();

  // Get user's businesses first
  const { data: userBusinesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId);

  const businessIds = (userBusinesses ?? []).map((b) => b.id);
  if (businessIds.length === 0) {
    return { module: "lapak", label: "Lapak", metrics: [] };
  }

  // Current period sales
  const { data: currentSales } = await supabase
    .from("sales_entries")
    .select("total")
    .in("business_id", businessIds)
    .gte("sold_at", sinceStr);

  // Previous period sales
  const { data: prevSales } = await supabase
    .from("sales_entries")
    .select("total")
    .in("business_id", businessIds)
    .gte("sold_at", prevSinceStr)
    .lt("sold_at", sinceStr);

  // Current expenses
  const { data: currentExpenses } = await supabase
    .from("lapak_expenses")
    .select("amount")
    .in("business_id", businessIds)
    .gte("created_at", sinceStr);

  // Active products count
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("business_id", businessIds)
    .eq("is_active", true);

  const totalSales = (currentSales ?? []).reduce((s, r) => s + (r.total ?? 0), 0);
  const totalPrevSales = (prevSales ?? []).reduce((s, r) => s + (r.total ?? 0), 0);
  const totalExpenses = (currentExpenses ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const profit = totalSales - totalExpenses;

  const salesTrend = calcTrend(totalSales, totalPrevSales);

  return {
    module: "lapak",
    label: "Lapak",
    metrics: [
      { key: "sales", label: "Penjualan", value: totalSales, formatted: formatRupiah(totalSales), ...salesTrend },
      { key: "expenses", label: "Pengeluaran", value: totalExpenses, formatted: formatRupiah(totalExpenses) },
      { key: "profit", label: "Keuntungan", value: profit, formatted: formatRupiah(profit) },
      { key: "products", label: "Produk Aktif", value: productCount ?? 0, formatted: String(productCount ?? 0) },
      { key: "transactions", label: "Transaksi", value: (currentSales ?? []).length, formatted: String((currentSales ?? []).length) },
    ],
  };
}

// ==================== SEWA ANALYTICS ====================

export async function getSewaAnalytics(userId: string): Promise<AnalyticsSummary> {
  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("user_id", userId);

  const propertyIds = (properties ?? []).map((p) => p.id);
  if (propertyIds.length === 0) {
    return { module: "sewa", label: "Sewa", metrics: [] };
  }

  const { data: units } = await supabase
    .from("property_units")
    .select("status, monthly_rent")
    .in("property_id", propertyIds);

  const { data: billings } = await supabase
    .from("rent_billings")
    .select("amount, status")
    .in("property_id", propertyIds)
    .eq("period", new Date().toISOString().slice(0, 7));

  const totalUnits = (units ?? []).length;
  const occupied = (units ?? []).filter((u) => u.status === "occupied").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
  const monthlyIncome = (units ?? []).filter((u) => u.status === "occupied").reduce((s, u) => s + (u.monthly_rent ?? 0), 0);
  const unpaid = (billings ?? []).filter((b) => b.status !== "paid").length;

  return {
    module: "sewa",
    label: "Sewa",
    metrics: [
      { key: "occupancy", label: "Okupansi", value: occupancyRate, formatted: `${occupancyRate}%` },
      { key: "units", label: "Total Unit", value: totalUnits, formatted: `${occupied}/${totalUnits}` },
      { key: "monthly_income", label: "Potensi Bulanan", value: monthlyIncome, formatted: formatRupiah(monthlyIncome) },
      { key: "unpaid", label: "Belum Bayar", value: unpaid, formatted: String(unpaid) },
    ],
  };
}

// ==================== WARGA ANALYTICS ====================

export async function getWargaAnalytics(userId: string): Promise<AnalyticsSummary> {
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", userId);

  const orgIds = (orgs ?? []).map((o) => o.id);
  if (orgIds.length === 0) {
    return { module: "warga", label: "Warga", metrics: [] };
  }

  const { count: memberCount } = await supabase
    .from("org_members")
    .select("*", { count: "exact", head: true })
    .in("org_id", orgIds);

  const currentPeriod = new Date().toISOString().slice(0, 7);
  const { data: dues } = await supabase
    .from("org_dues")
    .select("status, amount")
    .in("org_id", orgIds)
    .eq("period", currentPeriod);

  const { data: transactions } = await supabase
    .from("org_transactions")
    .select("type, amount")
    .in("org_id", orgIds);

  const totalDues = (dues ?? []).length;
  const paidDues = (dues ?? []).filter((d) => d.status === "paid").length;
  const duesRate = totalDues > 0 ? Math.round((paidDues / totalDues) * 100) : 0;
  const totalIncome = (transactions ?? []).filter((t) => t.type === "income").reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalExpense = (transactions ?? []).filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount ?? 0), 0);

  return {
    module: "warga",
    label: "Warga",
    metrics: [
      { key: "members", label: "Total Anggota", value: memberCount ?? 0, formatted: String(memberCount ?? 0) },
      { key: "dues_rate", label: "Iuran Lunas", value: duesRate, formatted: `${duesRate}%` },
      { key: "income", label: "Pemasukan", value: totalIncome, formatted: formatRupiah(totalIncome) },
      { key: "expense", label: "Pengeluaran", value: totalExpense, formatted: formatRupiah(totalExpense) },
      { key: "balance", label: "Saldo", value: totalIncome - totalExpense, formatted: formatRupiah(totalIncome - totalExpense) },
    ],
  };
}

// ==================== HAJAT ANALYTICS ====================

export async function getHajatAnalytics(userId: string): Promise<AnalyticsSummary> {
  const { data: events } = await supabase
    .from("hajat_events")
    .select("id, status")
    .eq("user_id", userId);

  const eventIds = (events ?? []).map((e) => e.id);
  const activeEvents = (events ?? []).filter((e) => e.status === "published").length;

  if (eventIds.length === 0) {
    return { module: "hajat", label: "Hajat", metrics: [] };
  }

  const { data: guests } = await supabase
    .from("event_guests")
    .select("rsvp_status, rsvp_count, checked_in")
    .in("event_id", eventIds);

  const totalGuests = (guests ?? []).length;
  const attending = (guests ?? []).filter((g) => g.rsvp_status === "attending").length;
  const checkedIn = (guests ?? []).filter((g) => g.checked_in).length;
  const totalAttendees = (guests ?? []).reduce((s, g) => s + (g.rsvp_status === "attending" ? g.rsvp_count : 0), 0);

  return {
    module: "hajat",
    label: "Hajat",
    metrics: [
      { key: "events", label: "Acara Aktif", value: activeEvents, formatted: String(activeEvents) },
      { key: "guests", label: "Total Undangan", value: totalGuests, formatted: String(totalGuests) },
      { key: "attending", label: "Hadir", value: attending, formatted: String(attending) },
      { key: "attendees", label: "Total Tamu", value: totalAttendees, formatted: String(totalAttendees) },
      { key: "checked_in", label: "Check-in", value: checkedIn, formatted: String(checkedIn) },
    ],
  };
}

// ==================== HELPERS ====================

function calcTrend(current: number, previous: number): { trend: "up" | "down" | "flat"; trendPercent: number } {
  if (previous === 0) return { trend: current > 0 ? "up" : "flat", trendPercent: 0 };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { trend: pct > 0 ? "up" : pct < 0 ? "down" : "flat", trendPercent: Math.abs(pct) };
}
