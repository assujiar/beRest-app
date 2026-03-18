-- beRest Lapak Module Migration
-- Tables: businesses, products, sales_entries, lapak_expenses

-------------------------------------------------------
-- 1. BUSINESSES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pedagang', 'laundry', 'guru', 'jasa_umum')),
  slug TEXT,
  description TEXT,
  address TEXT,
  logo_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_user ON businesses(user_id);
CREATE INDEX idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own businesses"
  ON businesses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view businesses by slug"
  ON businesses FOR SELECT
  USING (slug IS NOT NULL);

-------------------------------------------------------
-- 2. PRODUCTS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price BIGINT NOT NULL,
  category TEXT,
  description TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_business ON products(business_id, is_active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage products"
  ON products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = products.business_id AND b.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = products.business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-------------------------------------------------------
-- 3. SALES ENTRIES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price BIGINT NOT NULL,
  total BIGINT NOT NULL,
  notes TEXT,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_business_date ON sales_entries(business_id, sold_at DESC);

ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage sales"
  ON sales_entries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = sales_entries.business_id AND b.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = sales_entries.business_id AND b.user_id = auth.uid())
  );

-------------------------------------------------------
-- 4. LAPAK EXPENSES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS lapak_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  category TEXT,
  proof_photo TEXT,
  expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lapak_expenses_business_date ON lapak_expenses(business_id, expense_date DESC);

ALTER TABLE lapak_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage expenses"
  ON lapak_expenses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = lapak_expenses.business_id AND b.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = lapak_expenses.business_id AND b.user_id = auth.uid())
  );
