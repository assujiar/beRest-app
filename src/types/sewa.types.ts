export type PropertyType = "kos" | "kontrakan" | "rumah_sewa" | "apartment";
export type UnitStatus = "occupied" | "vacant" | "maintenance";
export type RentPaymentStatus = "unpaid" | "partial" | "paid" | "overdue";
export type ContractStatus = "draft" | "active" | "expired" | "terminated";
export type RentalStatus = "active" | "returned" | "overdue";
export type DepositStatus = "held" | "returned" | "deducted";

export interface Property {
  id: string;
  user_id: string;
  name: string;
  type: PropertyType;
  address: string | null;
  total_units: number | null;
  photos: string[];
  slug: string | null;
  created_at: string;
}

export interface PropertyUnit {
  id: string;
  property_id: string;
  unit_name: string;
  monthly_rent: number;
  status: UnitStatus;
  current_tenant_id: string | null;
  tenant_consumer_id: string | null;
  tenant_start_date: string | null;
  contract_end_date: string | null;
  deposit_amount: number;
  notes: string | null;
  photos: string[];
}

export interface Contract {
  id: string;
  user_id: string;
  contact_id: string | null;
  consumer_id: string | null;
  type: string;
  title: string;
  content_json: Record<string, unknown> | null;
  pdf_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ContractStatus;
  created_at: string;
}
