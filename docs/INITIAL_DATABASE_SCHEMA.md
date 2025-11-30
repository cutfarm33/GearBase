# Initial Database Schema

## Run this FIRST before the multi-tenancy migration

This creates all the base tables you need for GearBase.

---

## STEP 1: Create profiles table

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT,
  plan TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
```

---

## STEP 2: Create inventory_items table

```sql
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code TEXT UNIQUE,
  category TEXT,
  status TEXT DEFAULT 'Available',
  condition TEXT DEFAULT 'Good',
  notes TEXT,
  purchase_date DATE,
  value NUMERIC(10, 2),
  weight NUMERIC(10, 2),
  storage_case TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inventory_items_qr_code_idx ON inventory_items(qr_code);
CREATE INDEX IF NOT EXISTS inventory_items_category_idx ON inventory_items(category);
CREATE INDEX IF NOT EXISTS inventory_items_status_idx ON inventory_items(status);

COMMENT ON TABLE inventory_items IS 'Inventory/gear items';
```

---

## STEP 3: Create jobs table

```sql
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  producer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'Upcoming',
  gear_list JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS jobs_producer_id_idx ON jobs(producer_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
CREATE INDEX IF NOT EXISTS jobs_start_date_idx ON jobs(start_date);

COMMENT ON TABLE jobs IS 'Production jobs/projects';
```

---

## STEP 4: Create transactions table

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  items JSONB NOT NULL DEFAULT '[]',
  signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_job_id_idx ON transactions(job_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
CREATE INDEX IF NOT EXISTS transactions_timestamp_idx ON transactions(timestamp);

COMMENT ON TABLE transactions IS 'Check-in/check-out transactions';
```

---

## STEP 5: Create kits table (optional)

```sql
CREATE TABLE IF NOT EXISTS kits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  item_ids JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kits_name_idx ON kits(name);

COMMENT ON TABLE kits IS 'Equipment kits/packages';
```

---

## STEP 6: Enable Row Level Security (temporary, will be updated with org policies)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
```

---

## STEP 7: Create basic RLS policies (temporary, will be replaced with org policies)

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Temporarily allow all authenticated users to access data
-- (This will be replaced with organization-based policies)
CREATE POLICY "Authenticated users can view inventory"
  ON inventory_items FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage jobs"
  ON jobs FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage transactions"
  ON transactions FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage kits"
  ON kits FOR ALL
  USING (auth.role() = 'authenticated');
```

---

## STEP 8: Verify tables were created

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- `inventory_items`
- `jobs`
- `kits`
- `profiles`
- `transactions`

---

## ✅ Done!

Now you can proceed with the multi-tenancy migration:

Go to `MULTI_TENANCY_MIGRATION_STEP_BY_STEP.md` and start from **STEP 1**.
