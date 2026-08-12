-- ============================================================================
-- GearBase — post-remediation verification
-- Run in the Supabase SQL Editor AFTER both 2026-08-12 migrations.
--
-- Returns ONE result set (the editor only renders the last statement's output,
-- which is why the checks are unioned rather than run as separate queries).
--
-- Expected: only the "policy count" and "helper" rows appear. Any row under
-- checks 1, 3, 4 or 6 is something still to fix.
-- ============================================================================

SELECT check_name, detail
FROM (
    -- 1. Every public table must have RLS on.
    SELECT 1 AS ord,
           '1. RLS STILL OFF — must be empty' AS check_name,
           tablename AS detail
      FROM pg_tables
     WHERE schemaname = 'public'
       AND rowsecurity = false

    UNION ALL

    -- 2. Informational: the rebuilt policy sets.
    SELECT 2,
           '2. policy count',
           tablename || ' = ' || count(*)::text
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN ('profiles','inventory','kits','transactions','jobs',
                         'job_items','kit_items','transaction_items')
     GROUP BY tablename

    UNION ALL

    -- 3. SECURITY DEFINER functions with a role-mutable search_path (lint 0011).
    SELECT 3,
           '3. SECDEF fn without pinned search_path — must be empty',
           p.oid::regprocedure::text
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prosecdef
       AND (p.proconfig IS NULL
            OR NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'))

    UNION ALL

    -- 4. Write policies that are still effectively wide open (lint 0024).
    SELECT 4,
           '4. permissive write policy — must be empty',
           tablename || '.' || policyname || ' (' || cmd || ')'
      FROM pg_policies
     WHERE schemaname = 'public'
       AND cmd <> 'SELECT'
       AND (qual = 'true' OR with_check = 'true')

    UNION ALL

    -- 5. The helper must exist, in `private` and not in `public`.
    SELECT 5,
           '5. helper',
           'private.user_org_ids exists = '
           || EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                       WHERE n.nspname = 'private' AND p.proname = 'user_org_ids')::text
           || ', public.get_user_organization_id gone = '
           || (NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                            WHERE n.nspname = 'public' AND p.proname = 'get_user_organization_id'))::text

    UNION ALL

    -- 6. anon must not be able to create organizations, and the ambiguous
    --    single-argument overload must be gone.
    SELECT 6,
           '6. anon-callable provisioning RPC — must be empty',
           p.oid::regprocedure::text
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('create_organization_for_signup','claim_offline_profile')
       AND has_function_privilege('anon', p.oid, 'EXECUTE')
) checks
ORDER BY ord, detail;
