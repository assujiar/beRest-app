export type BusinessType = "pedagang" | "laundry" | "guru" | "jasa_umum";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: BusinessType;
  slug: string | null;
  description: string | null;
  address: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SalesEntry {
  id: string;
  business_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  notes: string | null;
  sold_at: string;
  created_at: string;
}

export interface LapakExpense {
  id: string;
  business_id: string;
  description: string;
  amount: number;
  category: string | null;
  proof_photo: string | null;
  expense_date: string;
  created_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  contact_id: string | null;
  consumer_id: string | null;
  order_code: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string | null;
  name: string;
  quantity: number;
  price: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  transactionCount: number;
}

// ==================== LAUNDRY MODE ====================

export type LaundryStatus =
  | "received"
  | "washing"
  | "drying"
  | "ironing"
  | "ready"
  | "picked_up"
  | "cancelled";

export interface LaundryOrder {
  id: string;
  business_id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string | null;
  consumer_id: string | null;
  items: LaundryItem[];
  total_weight: number | null;
  total: number;
  status: LaundryStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  estimated_done: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaundryItem {
  name: string;
  quantity: number;
  price: number;
}

export interface LaundryPricing {
  id: string;
  business_id: string;
  name: string;
  price_per_kg: number | null;
  price_per_piece: number | null;
  is_active: boolean;
}

// ==================== GURU/PELATIH MODE ====================

export type AttendanceStatus = "present" | "absent" | "excused";

export interface Student {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  consumer_id: string | null;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  business_id: string;
  day_of_week: number; // 0=Sun, 1=Mon...
  start_time: string; // "HH:MM"
  end_time: string;
  subject: string | null;
  location: string | null;
}

export interface Attendance {
  id: string;
  business_id: string;
  student_id: string;
  schedule_id: string | null;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
}

export interface StudentBilling {
  id: string;
  business_id: string;
  student_id: string;
  student_name: string;
  period: string;
  amount: number;
  status: PaymentStatus;
  paid_date: string | null;
  created_at: string;
}

// ==================== JASA UMUM MODE ====================

export type QueueStatus = "waiting" | "serving" | "completed" | "cancelled";

export interface QueueEntry {
  id: string;
  business_id: string;
  queue_number: number;
  customer_name: string;
  customer_phone: string | null;
  consumer_id: string | null;
  service_name: string | null;
  status: QueueStatus;
  notes: string | null;
  estimated_time: number | null; // minutes
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
}

export interface CustomerRecord {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
}
