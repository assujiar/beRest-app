import { supabase } from "./supabase";
import type {
  LaundryOrder,
  LaundryStatus,
  LaundryPricing,
  Student,
  Schedule,
  Attendance,
  AttendanceStatus,
  StudentBilling,
  QueueEntry,
  QueueStatus,
  CustomerRecord,
  PaymentStatus,
} from "@app-types/lapak.types";

// ==================== LAUNDRY ====================

function generateOrderCode(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LDR-${day}${rand}`;
}

export async function createLaundryOrder(
  businessId: string,
  order: Pick<LaundryOrder, "customer_name" | "customer_phone" | "consumer_id" | "items" | "total_weight" | "total" | "notes" | "estimated_done">
): Promise<LaundryOrder> {
  const { data, error } = await supabase
    .from("laundry_orders")
    .insert({ business_id: businessId, order_code: generateOrderCode(), status: "received" as LaundryStatus, payment_status: "unpaid" as PaymentStatus, ...order })
    .select().single();
  if (error) throw error;
  return data as LaundryOrder;
}

export async function getLaundryOrders(businessId: string, activeOnly = true): Promise<LaundryOrder[]> {
  let query = supabase.from("laundry_orders").select("*").eq("business_id", businessId);
  if (activeOnly) query = query.not("status", "in", '("picked_up","cancelled")');
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LaundryOrder[];
}

export async function updateLaundryStatus(id: string, status: LaundryStatus): Promise<LaundryOrder> {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from("laundry_orders").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as LaundryOrder;
}

export async function getLaundryByCode(code: string): Promise<LaundryOrder | null> {
  const { data, error } = await supabase.from("laundry_orders").select("*, businesses(name)").eq("order_code", code.toUpperCase()).single();
  if (error) return null;
  return data as LaundryOrder;
}

export async function getLaundryPricing(businessId: string): Promise<LaundryPricing[]> {
  const { data, error } = await supabase.from("laundry_pricing").select("*").eq("business_id", businessId).eq("is_active", true).order("name");
  if (error) throw error;
  return (data ?? []) as LaundryPricing[];
}

export async function upsertLaundryPricing(businessId: string, pricing: Pick<LaundryPricing, "name" | "price_per_kg" | "price_per_piece">): Promise<LaundryPricing> {
  const { data, error } = await supabase.from("laundry_pricing").upsert({ business_id: businessId, is_active: true, ...pricing }).select().single();
  if (error) throw error;
  return data as LaundryPricing;
}

// ==================== GURU/PELATIH ====================

export async function addStudent(businessId: string, student: Pick<Student, "name" | "phone" | "parent_name" | "parent_phone" | "consumer_id" | "monthly_fee">): Promise<Student> {
  const { data, error } = await supabase.from("students").insert({ business_id: businessId, is_active: true, ...student }).select().single();
  if (error) throw error;
  return data as Student;
}

export async function getStudents(businessId: string, activeOnly = true): Promise<Student[]> {
  let query = supabase.from("students").select("*").eq("business_id", businessId);
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query.order("name");
  if (error) throw error;
  return (data ?? []) as Student[];
}

export async function addSchedule(businessId: string, schedule: Pick<Schedule, "day_of_week" | "start_time" | "end_time" | "subject" | "location">): Promise<Schedule> {
  const { data, error } = await supabase.from("schedules").insert({ business_id: businessId, ...schedule }).select().single();
  if (error) throw error;
  return data as Schedule;
}

export async function getSchedules(businessId: string): Promise<Schedule[]> {
  const { data, error } = await supabase.from("schedules").select("*").eq("business_id", businessId).order("day_of_week").order("start_time");
  if (error) throw error;
  return (data ?? []) as Schedule[];
}

export async function recordAttendance(businessId: string, studentId: string, date: string, status: AttendanceStatus, scheduleId?: string): Promise<Attendance> {
  const { data, error } = await supabase.from("attendances").upsert({ business_id: businessId, student_id: studentId, date, status, schedule_id: scheduleId ?? null, notes: null }).select().single();
  if (error) throw error;
  return data as Attendance;
}

export async function getAttendanceByDate(businessId: string, date: string): Promise<Attendance[]> {
  const { data, error } = await supabase.from("attendances").select("*, students(name)").eq("business_id", businessId).eq("date", date);
  if (error) throw error;
  return (data ?? []) as Attendance[];
}

export async function generateStudentBilling(businessId: string, period: string): Promise<StudentBilling[]> {
  const students = await getStudents(businessId);
  const rows = students.map((s) => ({ business_id: businessId, student_id: s.id, student_name: s.name, period, amount: s.monthly_fee, status: "unpaid" as PaymentStatus }));
  const { data, error } = await supabase.from("student_billings").insert(rows).select();
  if (error) throw error;
  return (data ?? []) as StudentBilling[];
}

export async function getStudentBillings(businessId: string, period: string): Promise<StudentBilling[]> {
  const { data, error } = await supabase.from("student_billings").select("*").eq("business_id", businessId).eq("period", period).order("student_name");
  if (error) throw error;
  return (data ?? []) as StudentBilling[];
}

export async function updateStudentBillingStatus(id: string, status: PaymentStatus): Promise<StudentBilling> {
  const updates: Record<string, unknown> = { status };
  if (status === "paid") updates.paid_date = new Date().toISOString();
  const { data, error } = await supabase.from("student_billings").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as StudentBilling;
}

// ==================== JASA UMUM / QUEUE ====================

export async function createQueueEntry(businessId: string, entry: Pick<QueueEntry, "customer_name" | "customer_phone" | "consumer_id" | "service_name" | "notes" | "estimated_time">): Promise<QueueEntry> {
  // Get next queue number
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase.from("queue_entries").select("*", { count: "exact", head: true }).eq("business_id", businessId).gte("created_at", `${today}T00:00:00`);
  const queueNumber = (count ?? 0) + 1;

  const { data, error } = await supabase.from("queue_entries").insert({ business_id: businessId, queue_number: queueNumber, status: "waiting" as QueueStatus, ...entry }).select().single();
  if (error) throw error;
  return data as QueueEntry;
}

export async function getQueueToday(businessId: string): Promise<QueueEntry[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase.from("queue_entries").select("*").eq("business_id", businessId).gte("created_at", `${today}T00:00:00`).order("queue_number");
  if (error) throw error;
  return (data ?? []) as QueueEntry[];
}

export async function updateQueueStatus(id: string, status: QueueStatus): Promise<QueueEntry> {
  const updates: Record<string, unknown> = { status };
  if (status === "serving") updates.called_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();
  const { data, error } = await supabase.from("queue_entries").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as QueueEntry;
}

export async function getCurrentServing(businessId: string): Promise<QueueEntry | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase.from("queue_entries").select("*").eq("business_id", businessId).eq("status", "serving").gte("created_at", `${today}T00:00:00`).single();
  if (error) return null;
  return data as QueueEntry;
}

// ==================== CUSTOMER DATABASE ====================

export async function upsertCustomer(businessId: string, customer: Pick<CustomerRecord, "name" | "phone" | "tags" | "notes">): Promise<CustomerRecord> {
  const { data, error } = await supabase.from("customer_records").upsert({ business_id: businessId, total_orders: 0, total_spent: 0, ...customer }).select().single();
  if (error) throw error;
  return data as CustomerRecord;
}

export async function getCustomers(businessId: string, limit = 50): Promise<CustomerRecord[]> {
  const { data, error } = await supabase.from("customer_records").select("*").eq("business_id", businessId).order("last_order_at", { ascending: false, nullsFirst: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as CustomerRecord[];
}

export async function searchCustomers(businessId: string, query: string): Promise<CustomerRecord[]> {
  const { data, error } = await supabase.from("customer_records").select("*").eq("business_id", businessId).or(`name.ilike.%${query}%,phone.ilike.%${query}%`).limit(20);
  if (error) throw error;
  return (data ?? []) as CustomerRecord[];
}
