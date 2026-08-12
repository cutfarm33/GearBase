-- ============================================================================
-- GearBase — claim_offline_profile()
-- Date: 2026-08-12
-- Run AFTER migrations/2026-08-12_fix_security_advisories.sql
--
-- Why this exists:
--   A manager can pre-create an "offline" team member — a profiles row with a
--   random id and no auth.users match (addTeamMember, AppContext.tsx:1133).
--   When that person later signs up, their placeholder row is supposed to be
--   merged into their real account.
--
--   SignupScreen.tsx did that by querying profiles by email while still
--   anonymous, which only worked because RLS was off. It cannot be fixed by
--   simply moving the query after login either: a brand-new user belongs to no
--   organization, so profiles RLS correctly hides the manager's placeholder row
--   from them. The lookup has to run as definer.
--
--   This also fixes the merge itself. The old flow created a *new* org for the
--   user and then re-pointed the placeholder's jobs and transactions at them —
--   leaving those records in the manager's org, where the user still couldn't
--   see them. Claiming the placeholder's organization_id is what makes the
--   feature actually do what it looks like it does.
--
-- Safety properties:
--   * Requires a session; email comes from auth.users, never from the client.
--     Supabase has already verified that address before a session exists.
--   * Only claims rows whose id has no auth.users match, so a real account can
--     never be taken over.
--   * Refuses to run if the caller already has a profile.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.claim_offline_profile()
RETURNS uuid   -- organization_id of the claimed placeholder, or NULL if none
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid           uuid := auth.uid();
  caller_email  text;
  offline_row   public.profiles%ROWTYPE;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'claim_offline_profile requires an authenticated session';
  END IF;

  -- Already provisioned — nothing to claim.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = uid) THEN
    RETURN NULL;
  END IF;

  SELECT u.email INTO caller_email FROM auth.users u WHERE u.id = uid;
  IF caller_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT p.* INTO offline_row
    FROM public.profiles p
   WHERE lower(p.email) = lower(caller_email)
     AND p.id <> uid
     AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Re-point whatever the placeholder owned at the real user. Each is guarded
  -- separately because these columns are not present in every environment.
  BEGIN
    UPDATE public.jobs SET producer_id = uid WHERE producer_id = offline_row.id;
  EXCEPTION WHEN undefined_column OR undefined_table THEN NULL;
  END;

  BEGIN
    UPDATE public.transactions SET user_id = uid WHERE user_id = offline_row.id;
  EXCEPTION WHEN undefined_column OR undefined_table THEN NULL;
  END;

  BEGIN
    UPDATE public.transactions SET "assignedToId" = uid WHERE "assignedToId" = offline_row.id;
  EXCEPTION WHEN undefined_column OR undefined_table THEN NULL;
  END;

  DELETE FROM public.profiles WHERE id = offline_row.id;

  RETURN offline_row.organization_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_offline_profile() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.claim_offline_profile() TO authenticated;

SELECT 'claim_offline_profile() installed' AS status;
