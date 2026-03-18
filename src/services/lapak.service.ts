import { supabase } from "./supabase";
import type {
  Business,
  Product,
  SalesEntry,
  LapakExpense,
  DailySummary,
} from "@app-types/lapak.types";

// ==================== BUSINESS ====================

export async function createBusiness(
  userId: string,
  biz: Pick<Business, "name" | "type" | "description" | "address" | "logo_url">
): Promise<Business> {
  const slug = biz.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("businesses")
    .insert({ ...biz, user_id: userId, slug })
    .select()
    .single();

  if (error) throw error;
  return data as Business;
}

export async function getBusinesses(userId: string): Promise<Business[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Business[];
}

export async function getBusiness(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Business;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Business;
}

// ==================== PRODUCTS ====================

export async function createProduct(
  businessId: string,
  product: Pick<Product, "name" | "price" | "category" | "description" | "photo_url">
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({ business_id: businessId, is_active: true, sort_order: 0, ...product })
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function getProducts(
  businessId: string,
  activeOnly = true
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order")
    .order("name");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function updateProduct(
  id: string,
  updates: Partial<Pick<Product, "name" | "price" | "category" | "description" | "photo_url" | "is_active" | "sort_order">>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ==================== SALES (1-Tap) ====================

export async function recordSale(
  businessId: string,
  sale: Pick<SalesEntry, "product_id" | "product_name" | "quantity" | "price" | "notes">
): Promise<SalesEntry> {
  const total = sale.quantity * sale.price;

  const { data, error } = await supabase
    .from("sales_entries")
    .insert({
      business_id: businessId,
      total,
      sold_at: new Date().toISOString(),
      ...sale,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SalesEntry;
}

export async function recordQuickSale(
  businessId: string,
  productId: string,
  productName: string,
  price: number
): Promise<SalesEntry> {
  return recordSale(businessId, {
    product_id: productId,
    product_name: productName,
    quantity: 1,
    price,
    notes: null,
  });
}

export async function getSalesToday(businessId: string): Promise<SalesEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("sales_entries")
    .select("*")
    .eq("business_id", businessId)
    .gte("sold_at", today.toISOString())
    .order("sold_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SalesEntry[];
}

export async function getSalesByDateRange(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<SalesEntry[]> {
  const { data, error } = await supabase
    .from("sales_entries")
    .select("*")
    .eq("business_id", businessId)
    .gte("sold_at", startDate)
    .lte("sold_at", endDate)
    .order("sold_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SalesEntry[];
}

// ==================== EXPENSES ====================

export async function addExpense(
  businessId: string,
  expense: Pick<LapakExpense, "description" | "amount" | "category" | "proof_photo">
): Promise<LapakExpense> {
  const { data, error } = await supabase
    .from("lapak_expenses")
    .insert({
      business_id: businessId,
      expense_date: new Date().toISOString(),
      ...expense,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LapakExpense;
}

export async function getExpensesToday(
  businessId: string
): Promise<LapakExpense[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("lapak_expenses")
    .select("*")
    .eq("business_id", businessId)
    .gte("expense_date", today.toISOString())
    .order("expense_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LapakExpense[];
}

export async function getExpensesByDateRange(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<LapakExpense[]> {
  const { data, error } = await supabase
    .from("lapak_expenses")
    .select("*")
    .eq("business_id", businessId)
    .gte("expense_date", startDate)
    .lte("expense_date", endDate)
    .order("expense_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LapakExpense[];
}

// ==================== DAILY SUMMARY ====================

export async function getDailySummary(
  businessId: string,
  date?: string
): Promise<DailySummary> {
  const targetDate = date ?? new Date().toISOString().split("T")[0];
  const startOfDay = `${targetDate}T00:00:00.000Z`;
  const endOfDay = `${targetDate}T23:59:59.999Z`;

  const [sales, expenses] = await Promise.all([
    getSalesByDateRange(businessId, startOfDay, endOfDay),
    getExpensesByDateRange(businessId, startOfDay, endOfDay),
  ]);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    date: targetDate,
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,
    transactionCount: sales.length,
  };
}

export async function getWeeklySummary(
  businessId: string
): Promise<DailySummary[]> {
  const summaries: DailySummary[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const summary = await getDailySummary(businessId, dateStr);
    summaries.push(summary);
  }

  return summaries;
}
