-- Paginated list of users who had analytics activity in a time window.
-- Run in Supabase → SQL Editor after migration_037.
--
-- NOTE: profiles.email does not exist in this project — email is read
--       from auth.users via the SECURITY DEFINER privilege.

DROP FUNCTION IF EXISTS analytics_logged_in_users_page CASCADE;
CREATE OR REPLACE FUNCTION analytics_logged_in_users_page(
  p_since  timestamptz,
  p_limit  int,
  p_offset int
)
RETURNS TABLE (
  user_id       uuid,
  email         text,
  profile_name  text,
  event_count   int,
  last_seen_at  timestamptz,
  total_count   bigint
)
LANGUAGE plpgsql SECURITY DEFINER VOLATILE AS $$
DECLARE
  lim int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
  off int := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
  RETURN QUERY
  WITH agg AS (
    SELECT
      ae.user_id,
      COUNT(*)::int AS event_count,
      MAX(ae.created_at) AS last_seen_at
    FROM public.analytics_events ae
    WHERE ae.created_at >= p_since
      AND ae.user_id IS NOT NULL
    GROUP BY ae.user_id
  ),
  enriched AS (
    SELECT
      a.user_id,
      COALESCE(au.email, '')::text AS email,
      COALESCE(
        NULLIF(TRIM(p.display_name), ''),
        NULLIF(TRIM(p.username), ''),
        NULLIF(split_part(COALESCE(au.email, ''), '@', 1), ''),
        '—'
      )::text AS profile_name,
      a.event_count,
      a.last_seen_at,
      COUNT(*) OVER ()::bigint AS total_count
    FROM agg a
    LEFT JOIN public.profiles  p  ON p.id  = a.user_id
    LEFT JOIN auth.users        au ON au.id = a.user_id
  )
  SELECT
    e.user_id,
    e.email,
    e.profile_name,
    e.event_count,
    e.last_seen_at,
    e.total_count
  FROM enriched e
  ORDER BY e.last_seen_at DESC NULLS LAST, e.user_id ASC
  LIMIT lim
  OFFSET off;
END;
$$;
