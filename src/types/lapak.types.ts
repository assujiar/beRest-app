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
