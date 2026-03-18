-- beRest Lapak Advanced Modes Migration
-- Laundry, Guru/Pelatih, Jasa Umum, Customer DB

-- ==================== LAUNDRY ====================

CREATE TABLE IF NOT EXISTS laundry_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  consumer_id UUID REFERENCES profiles(id),
  items JSONB NOT NULL DEFAULT '[]',
  total_weight NUMERIC,
  total BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','washing','drying','ironing','ready','picked_up','cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','partial','paid')),
  notes TEXT,
  estimated_done TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_laundry_business ON laundry_orders(business_id, status);
CREATE INDEX idx_laundry_code ON laundry_orders(order_code);
ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage laundry" ON laundry_orders FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = laundry_orders.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = laundry_orders.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Consumers view own laundry" ON laundry_orders FOR SELECT USING (consumer_id = auth.uid());
CREATE POLICY "Public lookup by code" ON laundry_orders FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS laundry_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_per_kg BIGINT,
  price_per_piece BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (business_id, name)
);
ALTER TABLE laundry_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage pricing" ON laundry_pricing FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = laundry_pricing.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = laundry_pricing.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Public view pricing" ON laundry_pricing FOR SELECT USING (is_active = TRUE);

-- ==================== GURU/PELATIH ====================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  consumer_id UUID REFERENCES profiles(id),
  monthly_fee BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_students_business ON students(business_id, is_active);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage students" ON students FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = students.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = students.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Students/parents view own" ON students FOR SELECT USING (consumer_id = auth.uid());

CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject TEXT,
  location TEXT
);
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage schedules" ON schedules FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = schedules.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = schedules.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Public view schedules" ON schedules FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','excused')),
  notes TEXT,
  UNIQUE (student_id, date, schedule_id)
);
CREATE INDEX idx_attendances_date ON attendances(business_id, date);
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage attendance" ON attendances FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = attendances.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = attendances.business_id AND b.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS student_billings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  period TEXT NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid')),
  paid_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, period)
);
ALTER TABLE student_billings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage student billings" ON student_billings FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = student_billings.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = student_billings.business_id AND b.user_id = auth.uid()));

-- ==================== JASA UMUM / QUEUE ====================

CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  queue_number INT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  consumer_id UUID REFERENCES profiles(id),
  service_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','serving','completed','cancelled')),
  notes TEXT,
  estimated_time INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_queue_business ON queue_entries(business_id, created_at DESC);
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage queue" ON queue_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = queue_entries.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = queue_entries.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Public view queue" ON queue_entries FOR SELECT USING (TRUE);

-- ==================== CUSTOMER DATABASE ====================

CREATE TABLE IF NOT EXISTS customer_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  total_orders INT NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, phone)
);
CREATE INDEX idx_customers_business ON customer_records(business_id);
ALTER TABLE customer_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Biz owners manage customers" ON customer_records FOR ALL
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = customer_records.business_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = customer_records.business_id AND b.user_id = auth.uid()));

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE laundry_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
