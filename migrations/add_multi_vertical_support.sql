-- Multi-Vertical Support Migration
-- Run this in Supabase SQL Editor

-- 1. Add vertical column to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS vertical TEXT DEFAULT 'film'
  CHECK (vertical IN ('film', 'music', 'photo', 'general'));

-- 2. Add custom_fields JSONB to inventory for instrument-specific data
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- 3. Create loans table for simple item lending (no signatures required)
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  borrower_name TEXT NOT NULL,
  borrower_contact TEXT,
  notes TEXT,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  actual_return_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create public_galleries table for shareable collection views
CREATE TABLE IF NOT EXISTS public_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  name TEXT NOT NULL DEFAULT 'My Collection',
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  visibility_mode TEXT DEFAULT 'all' CHECK (visibility_mode IN ('all', 'selected')),
  visible_item_ids INTEGER[] DEFAULT '{}',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  show_values BOOLEAN DEFAULT false,
  show_condition BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loans_organization ON loans(organization_id);
CREATE INDEX IF NOT EXISTS idx_loans_item ON loans(item_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_public_galleries_token ON public_galleries(token);
CREATE INDEX IF NOT EXISTS idx_public_galleries_org ON public_galleries(organization_id);

-- 6. Enable RLS on new tables
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_galleries ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for loans table
CREATE POLICY "Users can view loans in their organization" ON loans
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create loans in their organization" ON loans
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update loans in their organization" ON loans
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete loans in their organization" ON loans
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- 8. RLS Policies for public_galleries table
CREATE POLICY "Users can view galleries in their organization" ON public_galleries
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage galleries in their organization" ON public_galleries
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- 9. Public access policy for galleries (read-only via token)
-- This allows unauthenticated access to enabled galleries
CREATE POLICY "Anyone can view enabled public galleries by token" ON public_galleries
  FOR SELECT USING (is_enabled = true);

-- 10. Function to get public gallery items (for unauthenticated access)
CREATE OR REPLACE FUNCTION get_public_gallery(gallery_token TEXT)
RETURNS TABLE (
  gallery_name TEXT,
  gallery_description TEXT,
  gallery_theme TEXT,
  show_values BOOLEAN,
  show_condition BOOLEAN,
  items JSONB
) AS $$
DECLARE
  gallery_record public_galleries%ROWTYPE;
BEGIN
  -- Get gallery settings
  SELECT * INTO gallery_record FROM public_galleries
  WHERE token = gallery_token AND is_enabled = true;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    gallery_record.name,
    gallery_record.description,
    gallery_record.theme,
    gallery_record.show_values,
    gallery_record.show_condition,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'name', i.name,
          'category', i.category,
          'image_url', i.image_url,
          'condition', CASE WHEN gallery_record.show_condition THEN i.condition ELSE NULL END,
          'value', CASE WHEN gallery_record.show_values THEN i.value ELSE NULL END,
          'custom_fields', i.custom_fields,
          'notes', i.notes
        )
      ) FILTER (WHERE i.id IS NOT NULL),
      '[]'::jsonb
    ) as items
  FROM inventory i
  WHERE i.organization_id = gallery_record.organization_id
    AND (
      gallery_record.visibility_mode = 'all'
      OR i.id = ANY(gallery_record.visible_item_ids)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Update existing organizations to 'film' vertical (migration for existing users)
UPDATE organizations SET vertical = 'film' WHERE vertical IS NULL;

-- 12. Ensure all existing inventory has empty custom_fields
UPDATE inventory SET custom_fields = '{}' WHERE custom_fields IS NULL;

-- 13. Update create_organization_for_signup function to accept vertical parameter
-- This replaces the existing function to support the new multi-vertical signup flow
CREATE OR REPLACE FUNCTION create_organization_for_signup(
  org_name TEXT,
  org_vertical TEXT DEFAULT 'film'
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create the organization with the specified vertical
  INSERT INTO organizations (name, vertical)
  VALUES (org_name, COALESCE(org_vertical, 'film'))
  RETURNING id INTO new_org_id;

  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
