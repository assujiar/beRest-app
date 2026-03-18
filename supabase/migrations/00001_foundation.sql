-- beRest Foundation Migration
-- Phase 0: Core tables for auth, contacts, connections, notifications

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- 1. PROFILES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'provider' CHECK (role IN ('provider', 'consumer', 'both')),
  active_modules TEXT[] NOT NULL DEFAULT '{}',
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-------------------------------------------------------
-- 2. CONTACTS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  ktp_photo TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_phone ON contacts(phone) WHERE phone IS NOT NULL;

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own contacts"
  ON contacts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------
-- 3. CONNECTION CODES
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS connection_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('lapak', 'sewa', 'warga', 'hajat')),
  connection_type TEXT NOT NULL CHECK (connection_type IN ('customer', 'tenant', 'member', 'guest')),
  reference_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_connection_codes_provider ON connection_codes(provider_id);
CREATE INDEX idx_connection_codes_code ON connection_codes(code) WHERE is_active = TRUE;

ALTER TABLE connection_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage own codes"
  ON connection_codes FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Anyone can lookup active codes"
  ON connection_codes FOR SELECT
  USING (is_active = TRUE);

-------------------------------------------------------
-- 4. CONSUMER CONNECTIONS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS consumer_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('lapak', 'sewa', 'warga', 'hajat')),
  connection_type TEXT NOT NULL CHECK (connection_type IN ('customer', 'tenant', 'member', 'guest')),
  reference_id UUID,
  connection_code TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending')),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  archived_by TEXT CHECK (archived_by IN ('consumer', 'provider', 'system')),
  archive_reason TEXT,
  auto_archive_at TIMESTAMPTZ,
  notes TEXT,

  UNIQUE (consumer_id, provider_id, module, reference_id)
);

CREATE INDEX idx_connections_consumer ON consumer_connections(consumer_id, status);
CREATE INDEX idx_connections_provider ON consumer_connections(provider_id, status);
CREATE INDEX idx_connections_auto_archive ON consumer_connections(auto_archive_at) WHERE auto_archive_at IS NOT NULL AND status = 'active';

ALTER TABLE consumer_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can view own connections"
  ON consumer_connections FOR SELECT
  USING (auth.uid() = consumer_id);

CREATE POLICY "Providers can view connections to them"
  ON consumer_connections FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Consumers can insert own connections"
  ON consumer_connections FOR INSERT
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Both sides can update connection"
  ON consumer_connections FOR UPDATE
  USING (auth.uid() = consumer_id OR auth.uid() = provider_id);

-------------------------------------------------------
-- 5. NOTIFICATIONS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id),
  module TEXT NOT NULL CHECK (module IN ('lapak', 'sewa', 'warga', 'hajat')),
  type TEXT NOT NULL CHECK (type IN ('order_update', 'payment_due', 'announcement', 'rsvp_reminder', 'schedule_reminder')),
  title TEXT NOT NULL,
  body TEXT,
  reference_type TEXT,
  reference_id UUID,
  deep_link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE); -- Edge functions and providers can create

-------------------------------------------------------
-- 6. PUSH TOKENS
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------
-- 7. REALTIME: Enable for consumer live updates
-------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE consumer_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
