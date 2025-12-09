-- Create Invitations Table for Team Management
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. CREATE INVITATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- ==========================================
-- 2. CREATE RLS POLICIES FOR INVITATIONS
-- ==========================================

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations to their organization
CREATE POLICY "Users can view their org's invitations"
ON invitations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Users can view invitations sent to their email
CREATE POLICY "Users can view invitations to their email"
ON invitations FOR SELECT
USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Organization owners/admins can create invitations
CREATE POLICY "Org owners can create invitations"
ON invitations FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- Users can update invitations sent to their email (to accept/decline)
CREATE POLICY "Users can update their own invitations"
ON invitations FOR UPDATE
USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Organization owners can delete invitations
CREATE POLICY "Org owners can delete invitations"
ON invitations FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- ==========================================
-- 3. CREATE HELPER FUNCTION TO GENERATE TOKENS
-- ==========================================

CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random token (32 characters)
  token := encode(gen_random_bytes(24), 'base64');
  -- Remove any characters that might cause URL issues
  token := replace(token, '/', '_');
  token := replace(token, '+', '-');
  RETURN token;
END;
$$;

-- ==========================================
-- 4. VERIFICATION
-- ==========================================

SELECT 'Invitations table created successfully' as status;

-- Check the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invitations'
ORDER BY ordinal_position;
