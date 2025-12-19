-- Migration: Add Receipts Table for Expense Tracking
-- Run this in Supabase SQL Editor

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitted_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Core expense data
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  vendor_name TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Personal Card',

  -- Mileage tracking (for Mileage category)
  mileage_miles DECIMAL(10, 2),  -- Number of miles driven (amount auto-calculated at $0.67/mile)

  -- Receipt image
  receipt_image_url TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_receipts_organization ON receipts(organization_id);
CREATE INDEX IF NOT EXISTS idx_receipts_job ON receipts(job_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_expense_date ON receipts(expense_date);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see receipts in their organization
CREATE POLICY "receipts_select_policy" ON receipts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert receipts for themselves, Admins/Producers can insert for anyone
CREATE POLICY "receipts_insert_policy" ON receipts
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update their own receipts, Admins can update any
CREATE POLICY "receipts_update_policy" ON receipts
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete their own receipts or admins can delete any
CREATE POLICY "receipts_delete_policy" ON receipts
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- UPGRADE: If table already exists, run this to add mileage column
-- =====================================================
-- ALTER TABLE receipts ADD COLUMN IF NOT EXISTS mileage_miles DECIMAL(10, 2);
