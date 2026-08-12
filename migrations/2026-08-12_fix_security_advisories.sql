-- ============================================================================
-- GearBase — Supabase security advisory remediation
-- Date: 2026-08-12
-- Run this ENTIRE file in the Supabase SQL Editor.
--
-- The script is IDEMPOTENT — every section drops before it creates, so it is
-- safe to run again after a failure or to re-run from the top at any time.
-- Do not assume a failed run rolled back: the SQL Editor commits as it goes, so
-- a statement that errors leaves everything before it applied. Re-running is
-- the correct recovery, not manual cleanup.
--
-- Root cause of the ERROR-level advisories: DISABLE_RLS_TEMP.sql was run
-- against production. It disabled RLS AND dropped every policy on
-- profiles / inventory / kits / transactions / jobs. Those five tables have
-- been readable and writable by any anon API key ever since.
--
-- This script recreates the policies FIRST, then enables RLS, so there is no
-- window where the app is locked out.
--
-- Sections marked [APP IMPACT] change client behaviour — see the notes.
-- ============================================================================


-- ============================================================================
-- 0. PREFLIGHT SNAPSHOT — read this output before you go further
-- ============================================================================
SELECT 'BEFORE: rls state' AS section, tablename, rowsecurity AS rls_enabled,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename) AS policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;


-- ============================================================================
-- 1. PRIVATE HELPER SCHEMA
--    public.get_user_organization_id() is a SECURITY DEFINER function sitting in
--    an API-exposed schema, so anon can call it over /rest/v1/rpc (advisories
--    0028/0029). The fix is not to revoke EXECUTE — RLS policy expressions run
--    as the calling role, so that would break the policies. Instead the helper
--    moves to a `private` schema that PostgREST does not expose.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Returns every organization id the current user may act on.
-- Built dynamically because organization_members / profiles.active_organization_id
-- may not exist on every environment.
DO $outer$
DECLARE
    has_members  boolean;
    has_active   boolean;
    body         text;
BEGIN
    SELECT EXISTS (SELECT 1 FROM pg_tables
                   WHERE schemaname = 'public' AND tablename = 'organization_members')
      INTO has_members;

    SELECT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'profiles'
                     AND column_name = 'active_organization_id')
      INTO has_active;

    body := $b$
        SELECT p.organization_id
          FROM public.profiles p
         WHERE p.id = (SELECT auth.uid())
           AND p.organization_id IS NOT NULL
    $b$;

    IF has_active THEN
        body := body || $b$
        UNION
        SELECT p.active_organization_id
          FROM public.profiles p
         WHERE p.id = (SELECT auth.uid())
           AND p.active_organization_id IS NOT NULL
        $b$;
    END IF;

    IF has_members THEN
        body := body || $b$
        UNION
        SELECT m.organization_id
          FROM public.organization_members m
         WHERE m.user_id = (SELECT auth.uid())
           AND m.organization_id IS NOT NULL
        $b$;
    END IF;

    -- Legacy fallback: AppContext uses `session.user.id` as organization_id when a
    -- profile has none (context/AppContext.tsx defaultOrgId). Including the user's
    -- own uid keeps that data reachable and leaks nothing — nobody else can claim it.
    body := body || $b$
        UNION
        SELECT (SELECT auth.uid()) WHERE auth.uid() IS NOT NULL
    $b$;

    EXECUTE format($f$
        CREATE OR REPLACE FUNCTION private.user_org_ids()
        RETURNS SETOF uuid
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        SET search_path = ''
        AS %L
    $f$, body);
END
$outer$;

REVOKE ALL ON FUNCTION private.user_org_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.user_org_ids() TO authenticated, service_role;


-- ============================================================================
-- 2. WIPE THE STALE POLICY SET ON THE FIVE COMPROMISED TABLES
--    Drops everything by name so the rebuild below is deterministic.
-- ============================================================================

DO $$
DECLARE r record;
BEGIN
    FOR r IN
        SELECT policyname, tablename
          FROM pg_policies
         WHERE schemaname = 'public'
           AND tablename IN ('profiles','inventory','kits','transactions','jobs',
                             'job_items','kit_items','transaction_items')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END
$$;


-- ============================================================================
-- 3. PROFILES
--    [APP IMPACT] SignupScreen.tsx:121 queries profiles by email while still
--    anonymous, to find an "offline" team-member profile to merge. That query
--    is exactly the leak this fixes — it will now return zero rows for anon.
--    See the notes at the bottom of this file for the required app change.
-- ============================================================================

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR organization_id IN (SELECT private.user_org_ids())
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = (SELECT auth.uid())                                -- own profile at signup
    OR organization_id IN (SELECT private.user_org_ids())   -- offline team members
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR organization_id IN (SELECT private.user_org_ids())
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR organization_id IN (SELECT private.user_org_ids())
  );

CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    organization_id IN (SELECT private.user_org_ids())
    AND id <> (SELECT auth.uid())      -- cannot delete yourself
  );


-- ============================================================================
-- 4. INVENTORY / JOBS / KITS / TRANSACTIONS
-- ============================================================================

DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['inventory','jobs','kits','transactions'] LOOP
        EXECUTE format($f$
            CREATE POLICY %I ON public.%I
              FOR SELECT TO authenticated
              USING (organization_id IN (SELECT private.user_org_ids()))
        $f$, t || '_select', t);

        EXECUTE format($f$
            CREATE POLICY %I ON public.%I
              FOR INSERT TO authenticated
              WITH CHECK (organization_id IN (SELECT private.user_org_ids()))
        $f$, t || '_insert', t);

        EXECUTE format($f$
            CREATE POLICY %I ON public.%I
              FOR UPDATE TO authenticated
              USING (organization_id IN (SELECT private.user_org_ids()))
              WITH CHECK (organization_id IN (SELECT private.user_org_ids()))
        $f$, t || '_update', t);

        EXECUTE format($f$
            CREATE POLICY %I ON public.%I
              FOR DELETE TO authenticated
              USING (organization_id IN (SELECT private.user_org_ids()))
        $f$, t || '_delete', t);
    END LOOP;
END
$$;

-- Public gallery read path. screens/PublicGalleryScreen.tsx:79 selects straight
-- from `inventory` as anon, so this policy has to exist or shared galleries 404.
-- Scoped to items that an *enabled* gallery actually exposes.
CREATE POLICY "Anyone can view inventory in enabled galleries" ON public.inventory
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.public_galleries g
       WHERE g.is_enabled = true
         AND g.organization_id = inventory.organization_id
         AND (g.visibility_mode = 'all' OR inventory.id = ANY (g.visible_item_ids))
    )
  );


-- ============================================================================
-- 5. JUNCTION TABLES — replaces the `USING (true)` policies (advisory 0024)
--    Access is derived from the parent row's organization.
-- ============================================================================

CREATE POLICY "job_items_all" ON public.job_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs j
                  WHERE j.id = job_items.job_id
                    AND j.organization_id IN (SELECT private.user_org_ids())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs j
                  WHERE j.id = job_items.job_id
                    AND j.organization_id IN (SELECT private.user_org_ids())));

CREATE POLICY "kit_items_all" ON public.kit_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kits k
                  WHERE k.id = kit_items.kit_id
                    AND k.organization_id IN (SELECT private.user_org_ids())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kits k
                  WHERE k.id = kit_items.kit_id
                    AND k.organization_id IN (SELECT private.user_org_ids())));

CREATE POLICY "transaction_items_all" ON public.transaction_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.transactions tx
                  WHERE tx.id = transaction_items.transaction_id
                    AND tx.organization_id IN (SELECT private.user_org_ids())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.transactions tx
                  WHERE tx.id = transaction_items.transaction_id
                    AND tx.organization_id IN (SELECT private.user_org_ids())));


-- ============================================================================
-- 6. TURN RLS ON — the actual fix for the ERROR advisories
-- ============================================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 7. ORGANIZATIONS — drop the `WITH CHECK (true)` INSERT policy (advisory 0024)
--    Orgs are created through create_organization_for_signup(), a SECURITY
--    DEFINER function that bypasses RLS, so no client-facing INSERT policy is
--    needed. Leaving it lets any signed-in user insert arbitrary org rows.
-- ============================================================================

DROP POLICY IF EXISTS "Allow organization creation" ON public.organizations;


-- ============================================================================
-- 8. UNUSED TABLES FROM ANOTHER PROJECT
--    air_slots / campaigns / clients / videos each carry an `Allow all access`
--    ALL policy with USING(true) + WITH CHECK(true), i.e. RLS is enabled but
--    doing nothing. Nothing in the GearBase codebase touches them.
--    Dropping the policy leaves RLS on with no policy = deny-all for anon and
--    authenticated; service_role still has full access.
-- ============================================================================

DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['air_slots','campaigns','clients','videos'] LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow all access', t);
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
            RAISE NOTICE 'Locked down unused table public.%', t;
        END IF;
    END LOOP;
END
$$;


-- ============================================================================
-- 9. FUNCTION search_path (advisory 0011)
--    Pins search_path on every flagged function without touching their bodies.
--    Uses `public, extensions, pg_temp` rather than '' because these bodies
--    reference tables and pgcrypto helpers unqualified; forcing '' would break
--    them at runtime. pg_temp is pinned last, which is what the lint is about.
-- ============================================================================

DO $$
DECLARE f record;
BEGIN
    FOR f IN
        SELECT p.oid::regprocedure AS sig
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'
           AND p.proname IN ('get_founder_count',
                             'get_public_gallery',
                             'create_organization_for_signup',
                             'generate_invitation_token',
                             'get_user_organization_id',
                             'set_organization_id')
    LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions, pg_temp', f.sig);
        RAISE NOTICE 'search_path pinned on %', f.sig;
    END LOOP;
END
$$;


-- ============================================================================
-- 10. SECURITY DEFINER EXPOSURE (advisories 0028 / 0029)
-- ============================================================================

-- 10a. create_organization_for_signup exists as TWO overloads — (org_name) and
--      (org_name, org_vertical DEFAULT 'film'). A one-argument RPC call is
--      ambiguous between them, which is a live bug as well as a duplicate
--      advisory. Drop the legacy single-argument version.
DROP FUNCTION IF EXISTS public.create_organization_for_signup(text);

-- 10b. [APP IMPACT] Stop anon from creating organizations. Read the note at the
--      bottom before running this if you have email confirmation enabled.
REVOKE EXECUTE ON FUNCTION public.create_organization_for_signup(text, text) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_organization_for_signup(text, text) TO authenticated;

-- 10c. Refuse to run unauthenticated even if the grant is ever restored.
CREATE OR REPLACE FUNCTION public.create_organization_for_signup(
  org_name TEXT,
  org_vertical TEXT DEFAULT 'film'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'create_organization_for_signup requires an authenticated session';
  END IF;

  INSERT INTO public.organizations (name, vertical)
  VALUES (org_name, COALESCE(org_vertical, 'film'))
  RETURNING id INTO new_org_id;

  RETURN new_org_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_organization_for_signup(text, text) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_organization_for_signup(text, text) TO authenticated;

-- 10d. get_user_organization_id() is now superseded by private.user_org_ids().
--      Plain DROP (no CASCADE) on purpose: if this errors with a dependency
--      message, some policy still calls it — port that policy first, then rerun.
DROP FUNCTION IF EXISTS public.get_user_organization_id();

-- 10e. get_founder_count() and get_public_gallery() are INTENTIONALLY anon
--      callable — the pricing page and shared gallery links need them without a
--      session. Their advisories are expected and can be ignored. They are
--      narrow reads, and get_public_gallery already honours show_values /
--      show_condition. No change.


-- ============================================================================
-- 11. STORAGE — public bucket listing (advisory 0025)
--     The `inventory` bucket is public, so object URLs resolve via
--     getPublicUrl() with no SELECT policy at all. The broad SELECT policy only
--     adds the ability to LIST every file in the bucket, for anyone. Replace it
--     with an owner-scoped one so uploads/overwrites still work.
--     Paths are `<orgId>/logo.ext` (uploadLogo) and `<userId>/<file>`
--     (uploadImage), both covered by private.user_org_ids().
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can list their inventory objects" ON storage.objects;

CREATE POLICY "Owners can list their inventory objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'inventory'
    AND (storage.foldername(name))[1] IN (
      SELECT o.id::text FROM private.user_org_ids() AS o(id)
    )
  );


-- ============================================================================
-- 12. VERIFICATION
-- ============================================================================

SELECT 'AFTER: tables still missing RLS' AS section, tablename
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false
ORDER BY tablename;

SELECT 'AFTER: policies' AS section, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles','inventory','kits','transactions','jobs',
                    'job_items','kit_items','transaction_items','organizations')
ORDER BY tablename, cmd, policyname;

SELECT 'AFTER: functions without pinned search_path' AS section,
       p.oid::regprocedure::text AS fn
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef
  AND (p.proconfig IS NULL
       OR NOT EXISTS (SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'));

SELECT 'DONE — review the three result sets above' AS status;


-- ============================================================================
-- NOTES / FOLLOW-UPS THAT ARE NOT SQL
-- ============================================================================
--
-- A. [DONE — code side already updated] The anon `select id from profiles where
--    email = ...` in SignupScreen.tsx and the anon org/profile creation that
--    followed it have been removed. Signup now only calls auth.signUp(), and
--    AppContext.checkAuth provisions on first authenticated load.
--    REQUIRED: also run migrations/2026-08-12_claim_offline_profile.sql, which
--    installs the SECURITY DEFINER RPC that replaces the offline-profile merge.
--    Deploying this SQL without that migration and the new client code leaves
--    new signups with no profile.
--
-- B. [DONE — see A] Section 10b/10c requires a session at signup time, which the
--    new flow satisfies because provisioning moved to first authenticated load.
--
-- C. Leaked password protection (auth_leaked_password_protection) cannot be set
--    from SQL. Dashboard → Authentication → Policies → enable
--    "Prevent use of leaked passwords" (HaveIBeenPwned check).
--
-- D. Not in the advisories but worth fixing: PublicGalleryScreen.tsx selects
--    `*` from inventory, so a shared gallery link returns every column —
--    including `value` — regardless of the gallery's show_values setting. The
--    get_public_gallery() RPC already redacts correctly. Switch the screen to
--    the RPC, or select an explicit column list.
--
-- E. Also not flagged: the public_galleries policy
--    "Anyone can view enabled public galleries by token" is
--    `FOR SELECT USING (is_enabled = true)`, which lets anon enumerate every
--    enabled gallery and its token, not just the one they hold a link for.
--    Moving PublicGalleryScreen to get_public_gallery() (see D) lets you drop
--    that policy entirely.
-- ============================================================================
