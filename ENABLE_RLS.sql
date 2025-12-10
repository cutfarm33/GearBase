-- ==========================================
-- CRITICAL: ENABLE ROW LEVEL SECURITY
-- ==========================================
-- This script enables RLS on all tables.
-- RLS policies already exist but are NOT active!
-- Run this in Supabase SQL Editor to fix data isolation.
-- ==========================================

-- Enable RLS on all main tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on junction tables
ALTER TABLE public.job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on organization tables
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        EXECUTE 'ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invitations') THEN
        EXECUTE 'ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos') THEN
        EXECUTE 'ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        EXECUTE 'ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        EXECUTE 'ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'air_slots') THEN
        EXECUTE 'ALTER TABLE public.air_slots ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show success message
SELECT 'RLS has been enabled on all tables!' as status;
