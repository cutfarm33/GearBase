-- Founder's Deal Migration
-- Creates table and functions for tracking the first 100 lifetime Pro users

-- Table to track founder purchases
CREATE TABLE IF NOT EXISTS founder_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 2900, -- in cents
  founder_number INTEGER NOT NULL, -- 1-100
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure one founder deal per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_founder_deals_user ON founder_deals(user_id);

-- Index for fast count queries
CREATE INDEX IF NOT EXISTS idx_founder_deals_created ON founder_deals(created_at);

-- RLS: users can read their own founder deal
ALTER TABLE founder_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own founder deal"
  ON founder_deals FOR SELECT
  USING (auth.uid() = user_id);

-- Public function to get founder count (no auth needed for pricing page)
CREATE OR REPLACE FUNCTION get_founder_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0) FROM founder_deals;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_founder_count() TO anon, authenticated;
