import { supabase } from "./supabase";
import type {
  Property,
  PropertyUnit,
  RentBilling,
  SewaExpense,
  MaintenanceRequest,
  Contract,
  UnitStatus,
  RentPaymentStatus,
  MaintenanceStatus,
  ContractStatus,
} from "@app-types/sewa.types";

// ==================== PROPERTIES ====================

export async function createProperty(
  userId: string,
  prop: Pick<Property, "name" | "type" | "address" | "total_units">
): Promise<Property> {
  const slug = prop.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...prop, user_id: userId, slug, photos: [] })
    .select().single();
  if (error) throw error;
  return data as Property;
}

export async function getProperties(userId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties").select("*").eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();
  if (error) return null;
  return data as Property;
}

// ==================== UNITS ====================

export async function addUnit(
  propertyId: string,
  unit: Pick<PropertyUnit, "unit_name" | "monthly_rent">
): Promise<PropertyUnit> {
  const { data, error } = await supabase
    .from("property_units")
    .insert({
      property_id: propertyId,
      status: "vacant" as UnitStatus,
      deposit_amount: 0,
      deposit_status: "held",
      photos: [],
      ...unit,
    })
    .select().single();
  if (error) throw error;
  return data as PropertyUnit;
}

export async function getUnits(propertyId: string): Promise<PropertyUnit[]> {
  const { data, error } = await supabase
    .from("property_units").select("*").eq("property_id", propertyId)
    .order("unit_name");
  if (error) throw error;
  return (data ?? []) as PropertyUnit[];
}

export async function updateUnit(
  id: string,
  updates: Partial<PropertyUnit>
): Promise<PropertyUnit> {
  const { data, error } = await supabase
    .from("property_units").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as PropertyUnit;
}

export async function assignTenant(
  unitId: string,
  tenant: {
    tenant_name: string;
    tenant_phone: string | null;
    tenant_ktp_photo: string | null;
    tenant_consumer_id: string | null;
    tenant_start_date: string;
    contract_end_date: string | null;
    deposit_amount: number;
  }
): Promise<PropertyUnit> {
  return updateUnit(unitId, {
    ...tenant,
    status: "occupied" as UnitStatus,
    deposit_status: "held",
  } as Partial<PropertyUnit>);
}

export async function removeTenant(unitId: string): Promise<PropertyUnit> {
  return updateUnit(unitId, {
    status: "vacant" as UnitStatus,
    current_tenant_id: null,
    tenant_consumer_id: null,
    tenant_name: null,
    tenant_phone: null,
    tenant_start_date: null,
    contract_end_date: null,
  } as Partial<PropertyUnit>);
}

export async function getVacantUnits(propertyId: string): Promise<PropertyUnit[]> {
  const { data, error } = await supabase
    .from("property_units").select("*")
    .eq("property_id", propertyId).eq("status", "vacant")
    .order("unit_name");
  if (error) throw error;
  return (data ?? []) as PropertyUnit[];
}

// ==================== BILLING ====================

export async function generateMonthlyBilling(
  propertyId: string,
  period: string
): Promise<RentBilling[]> {
  const units = await getUnits(propertyId);
  const occupiedUnits = units.filter((u) => u.status === "occupied" && u.tenant_name);

  const dueDate = new Date();
  dueDate.setDate(10); // Due on 10th

  const rows = occupiedUnits.map((u) => ({
    unit_id: u.id,
    property_id: propertyId,
    tenant_name: u.tenant_name!,
    period,
    amount: u.monthly_rent,
    status: "unpaid" as RentPaymentStatus,
    due_date: dueDate.toISOString(),
  }));

  const { data, error } = await supabase.from("rent_billings").insert(rows).select();
  if (error) throw error;
  return (data ?? []) as RentBilling[];
}

export async function getBillingByPeriod(
  propertyId: string,
  period: string
): Promise<RentBilling[]> {
  const { data, error } = await supabase
    .from("rent_billings").select("*")
    .eq("property_id", propertyId).eq("period", period)
    .order("tenant_name");
  if (error) throw error;
  return (data ?? []) as RentBilling[];
}

export async function updateBillingStatus(
  id: string,
  status: RentPaymentStatus,
  proofPhoto?: string
): Promise<RentBilling> {
  const updates: Record<string, unknown> = { status };
  if (status === "paid") updates.paid_date = new Date().toISOString();
  if (proofPhoto) updates.proof_photo = proofPhoto;

  const { data, error } = await supabase
    .from("rent_billings").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as RentBilling;
}

export async function getTenantBillings(
  consumerId: string
): Promise<RentBilling[]> {
  const { data: units } = await supabase
    .from("property_units").select("id")
    .eq("tenant_consumer_id", consumerId);

  if (!units?.length) return [];
  const unitIds = units.map((u) => u.id);

  const { data, error } = await supabase
    .from("rent_billings").select("*")
    .in("unit_id", unitIds)
    .order("period", { ascending: false }).limit(12);
  if (error) throw error;
  return (data ?? []) as RentBilling[];
}

// ==================== EXPENSES ====================

export async function addSewaExpense(
  propertyId: string,
  expense: Pick<SewaExpense, "unit_id" | "description" | "amount" | "category" | "proof_photo">
): Promise<SewaExpense> {
  const { data, error } = await supabase
    .from("sewa_expenses")
    .insert({ property_id: propertyId, expense_date: new Date().toISOString(), ...expense })
    .select().single();
  if (error) throw error;
  return data as SewaExpense;
}

export async function getSewaExpenses(propertyId: string, limit = 50): Promise<SewaExpense[]> {
  const { data, error } = await supabase
    .from("sewa_expenses").select("*").eq("property_id", propertyId)
    .order("expense_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as SewaExpense[];
}

// ==================== MAINTENANCE ====================

export async function createMaintenanceRequest(
  req: Pick<MaintenanceRequest, "property_id" | "unit_id" | "requested_by" | "consumer_id" | "title" | "description" | "priority"> & { photos?: string[] }
): Promise<MaintenanceRequest> {
  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({ status: "pending" as MaintenanceStatus, photos: req.photos ?? [], ...req })
    .select().single();
  if (error) throw error;
  return data as MaintenanceRequest;
}

export async function getMaintenanceRequests(
  propertyId: string
): Promise<MaintenanceRequest[]> {
  const { data, error } = await supabase
    .from("maintenance_requests").select("*").eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MaintenanceRequest[];
}

export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceStatus,
  resolutionNotes?: string
): Promise<MaintenanceRequest> {
  const updates: Record<string, unknown> = { status };
  if (status === "completed") updates.resolved_at = new Date().toISOString();
  if (resolutionNotes) updates.resolution_notes = resolutionNotes;

  const { data, error } = await supabase
    .from("maintenance_requests").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as MaintenanceRequest;
}

// ==================== CONTRACTS ====================

export async function createContract(
  userId: string,
  contract: Pick<Contract, "unit_id" | "contact_id" | "consumer_id" | "type" | "title" | "content_json" | "start_date" | "end_date">
): Promise<Contract> {
  const { data, error } = await supabase
    .from("contracts")
    .insert({ user_id: userId, status: "draft" as ContractStatus, ...contract })
    .select().single();
  if (error) throw error;
  return data as Contract;
}

export async function getContracts(userId: string): Promise<Contract[]> {
  const { data, error } = await supabase
    .from("contracts").select("*").eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Contract[];
}

export async function updateContractStatus(
  id: string,
  status: ContractStatus
): Promise<Contract> {
  const { data, error } = await supabase
    .from("contracts").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data as Contract;
}

// ==================== SUMMARY ====================

export async function getPropertySummary(propertyId: string) {
  const units = await getUnits(propertyId);
  const occupied = units.filter((u) => u.status === "occupied").length;
  const vacant = units.filter((u) => u.status === "vacant").length;
  const totalRent = units.filter((u) => u.status === "occupied").reduce((sum, u) => sum + u.monthly_rent, 0);

  return { total: units.length, occupied, vacant, totalRent };
}
