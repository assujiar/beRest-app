-- beRest Sewa Module Migration
-- Tables: properties, property_units, rent_billings, sewa_expenses,
--         maintenance_requests, contracts

-------------------------------------------------------
-- 1. PROPERTIES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('kos', 'kontrakan', 'rumah_sewa', 'apartment')),
  address TEXT,
  total_units INT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_user ON properties(user_id);
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage properties" ON properties FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------
-- 2. PROPERTY UNITS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  monthly_rent BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  current_tenant_id UUID REFERENCES contacts(id),
  tenant_consumer_id UUID REFERENCES profiles(id),
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_ktp_photo TEXT,
  tenant_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  deposit_amount BIGINT NOT NULL DEFAULT 0,
  deposit_status TEXT NOT NULL DEFAULT 'held' CHECK (deposit_status IN ('held', 'returned', 'deducted')),
  notes TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_units_property ON property_units(property_id);
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners manage units" ON property_units FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = property_units.property_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = property_units.property_id AND p.user_id = auth.uid()));

CREATE POLICY "Tenants can view own unit" ON property_units FOR SELECT
  USING (tenant_consumer_id = auth.uid());

-------------------------------------------------------
-- 3. RENT BILLINGS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS rent_billings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES property_units(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  period TEXT NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  proof_photo TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (unit_id, period)
);

CREATE INDEX idx_billings_property_period ON rent_billings(property_id, period);
ALTER TABLE rent_billings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners manage billings" ON rent_billings FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_billings.property_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = rent_billings.property_id AND p.user_id = auth.uid()));

CREATE POLICY "Tenants view own billings" ON rent_billings FOR SELECT
  USING (EXISTS (SELECT 1 FROM property_units pu WHERE pu.id = rent_billings.unit_id AND pu.tenant_consumer_id = auth.uid()));

CREATE POLICY "Tenants update own billings" ON rent_billings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM property_units pu WHERE pu.id = rent_billings.unit_id AND pu.tenant_consumer_id = auth.uid()));

-------------------------------------------------------
-- 4. SEWA EXPENSES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS sewa_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id),
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  category TEXT,
  proof_photo TEXT,
  expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sewa_expenses_property ON sewa_expenses(property_id, expense_date DESC);
ALTER TABLE sewa_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners manage expenses" ON sewa_expenses FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = sewa_expenses.property_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = sewa_expenses.property_id AND p.user_id = auth.uid()));

-------------------------------------------------------
-- 5. MAINTENANCE REQUESTS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES property_units(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL CHECK (requested_by IN ('tenant', 'owner')),
  consumer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_property ON maintenance_requests(property_id, status);
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners manage maintenance" ON maintenance_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = maintenance_requests.property_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = maintenance_requests.property_id AND p.user_id = auth.uid()));

CREATE POLICY "Tenants can create and view maintenance" ON maintenance_requests FOR SELECT
  USING (consumer_id = auth.uid());

CREATE POLICY "Tenants can insert maintenance" ON maintenance_requests FOR INSERT
  WITH CHECK (consumer_id = auth.uid());

-------------------------------------------------------
-- 6. CONTRACTS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  consumer_id UUID REFERENCES profiles(id),
  unit_id UUID REFERENCES property_units(id),
  type TEXT NOT NULL DEFAULT 'sewa',
  title TEXT NOT NULL,
  content_json JSONB,
  pdf_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_user ON contracts(user_id, status);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage contracts" ON contracts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Consumers view own contracts" ON contracts FOR SELECT
  USING (consumer_id = auth.uid());

-------------------------------------------------------
-- REALTIME
-------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE rent_billings;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;
