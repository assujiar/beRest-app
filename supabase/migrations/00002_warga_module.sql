-- beRest Warga Module Migration
-- Tables: organizations, org_members, dues_configs, org_dues, org_transactions,
--         announcements, announcement_reads, fundraisings

-------------------------------------------------------
-- 1. ORGANIZATIONS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rt_rw', 'komplek', 'mesjid', 'pengajian', 'klub', 'sekolah', 'alumni', 'other')),
  slug TEXT,
  description TEXT,
  logo_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_user ON organizations(user_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage own orgs"
  ON organizations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------
-- 2. ORG MEMBERS (must be created before org policy that references it)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  consumer_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'treasurer', 'member')),
  member_code TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_consumer ON org_members(consumer_id) WHERE consumer_id IS NOT NULL;

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners can manage members"
  ON org_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_members.org_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_members.org_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Members can view own membership"
  ON org_members FOR SELECT
  USING (consumer_id = auth.uid());

-- Consumer can view orgs they're connected to (after org_members exists)
CREATE POLICY "Connected consumers can view org"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consumer_connections cc
      JOIN org_members om ON om.org_id = organizations.id AND om.consumer_id = cc.consumer_id
      WHERE cc.consumer_id = auth.uid() AND cc.status = 'active'
    )
  );

-------------------------------------------------------
-- 3. DUES CONFIG
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS dues_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount BIGINT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'yearly', 'custom')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dues_configs_org ON dues_configs(org_id, is_active);

ALTER TABLE dues_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners manage dues configs"
  ON dues_configs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = dues_configs.org_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = dues_configs.org_id AND o.user_id = auth.uid())
  );

-------------------------------------------------------
-- 4. ORG DUES (per member per period)
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_dues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'partial', 'exempt')),
  paid_date TIMESTAMPTZ,
  proof_photo TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (org_id, member_id, period)
);

CREATE INDEX idx_org_dues_period ON org_dues(org_id, period, status);

ALTER TABLE org_dues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners manage dues"
  ON org_dues FOR ALL
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_dues.org_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_dues.org_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Members can view and update own dues"
  ON org_dues FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM org_members om WHERE om.id = org_dues.member_id AND om.consumer_id = auth.uid())
  );

CREATE POLICY "Members can upload proof"
  ON org_dues FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM org_members om WHERE om.id = org_dues.member_id AND om.consumer_id = auth.uid())
  );

-------------------------------------------------------
-- 5. ORG TRANSACTIONS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  description TEXT NOT NULL,
  amount BIGINT NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  proof_photo TEXT,
  donor_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_org_transactions_org ON org_transactions(org_id, transaction_date DESC);

ALTER TABLE org_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners manage transactions"
  ON org_transactions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_transactions.org_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = org_transactions.org_id AND o.user_id = auth.uid())
  );

-- Public financial reports (read-only via portal)
CREATE POLICY "Public can view transactions for public orgs"
  ON org_transactions FOR SELECT
  USING (TRUE);

-------------------------------------------------------
-- 6. ANNOUNCEMENTS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_org ON announcements(org_id, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = announcements.org_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = announcements.org_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Members can view announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members om
      WHERE om.org_id = announcements.org_id AND om.consumer_id = auth.uid()
    )
  );

-------------------------------------------------------
-- 7. ANNOUNCEMENT READS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES org_members(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (announcement_id, member_id)
);

ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reads"
  ON announcement_reads FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Org owners can view reads"
  ON announcement_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM announcements a
      JOIN organizations o ON o.id = a.org_id
      WHERE a.id = announcement_reads.announcement_id AND o.user_id = auth.uid()
    )
  );

-------------------------------------------------------
-- 8. FUNDRAISINGS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS fundraisings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount BIGINT NOT NULL,
  collected_amount BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fundraisings_org ON fundraisings(org_id, status);

ALTER TABLE fundraisings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners manage fundraisings"
  ON fundraisings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = fundraisings.org_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = fundraisings.org_id AND o.user_id = auth.uid())
  );

-- Public view for portal
CREATE POLICY "Public can view fundraisings"
  ON fundraisings FOR SELECT
  USING (TRUE);

-------------------------------------------------------
-- REALTIME for consumer updates
-------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE org_dues;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
