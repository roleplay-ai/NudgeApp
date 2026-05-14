-- ============================================================
-- Analytics RPC functions — server-side aggregation
-- Run in Supabase → SQL Editor.
-- ============================================================

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS analytics_events_event_created_at_idx
  ON public.analytics_events (event, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_ip_created_at_idx
  ON public.analytics_events (ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_visitor_created_at_idx
  ON public.analytics_events (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_user_created_at_idx
  ON public.analytics_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_meta_item_idx
  ON public.analytics_events USING gin (meta jsonb_path_ops);


-- ── 1. KPIs ───────────────────────────────────────────────────
DROP FUNCTION IF EXISTS analytics_kpis CASCADE;
CREATE OR REPLACE FUNCTION analytics_kpis(since_ts timestamptz)
RETURNS TABLE (
  "pageViews"      int,
  "uniqueSessions" int,
  "uniqueIps"      int,
  "loggedInUsers"  int,
  "totalEvents"    int
)
LANGUAGE plpgsql SECURITY DEFINER VOLATILE AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(ae.*) FILTER (WHERE ae.event = 'page_view')::int,
    COUNT(DISTINCT ae.visitor_id)::int,
    COUNT(DISTINCT ae.ip_address)::int,
    COUNT(DISTINCT ae.user_id) FILTER (WHERE ae.user_id IS NOT NULL)::int,
    COUNT(ae.*)::int
  FROM public.analytics_events ae
  WHERE ae.created_at >= since_ts;
END;
$$;


-- ── 2. Daily breakdown ────────────────────────────────────────
DROP FUNCTION IF EXISTS analytics_daily CASCADE;
CREATE OR REPLACE FUNCTION analytics_daily(since_ts timestamptz)
RETURNS TABLE (
  day             text,
  views           int,
  unique_sessions int,
  unique_ips      int
)
LANGUAGE plpgsql SECURITY DEFINER VOLATILE AS $$
BEGIN
  RETURN QUERY
  SELECT
    (ae.created_at::date)::text,
    COUNT(ae.*) FILTER (WHERE ae.event = 'page_view')::int,
    COUNT(DISTINCT ae.visitor_id)::int,
    COUNT(DISTINCT ae.ip_address)::int
  FROM public.analytics_events ae
  WHERE ae.created_at >= since_ts
  GROUP BY ae.created_at::date
  ORDER BY ae.created_at::date ASC;
END;
$$;


-- ── 3. Event breakdown ────────────────────────────────────────
DROP FUNCTION IF EXISTS analytics_event_breakdown CASCADE;
CREATE OR REPLACE FUNCTION analytics_event_breakdown(since_ts timestamptz)
RETURNS TABLE (
  event text,
  count int
)
LANGUAGE plpgsql SECURITY DEFINER VOLATILE AS $$
BEGIN
  RETURN QUERY
  SELECT ae.event, COUNT(ae.*)::int
  FROM public.analytics_events ae
  WHERE ae.created_at >= since_ts
  GROUP BY ae.event
  ORDER BY COUNT(ae.*) DESC;
END;
$$;


-- ── 4. Content leaderboard ────────────────────────────────────
-- plpgsql guarantees named parameters (p_since, p_event_type) are
-- never confused with table columns — the root cause of all tabs
-- returning the same data when written as a sql-language function.
-- Groups by a single canonical key so the same item is never
-- duplicated even when item_id is null or url differs per event.
DROP FUNCTION IF EXISTS analytics_content_leaderboard CASCADE;
CREATE OR REPLACE FUNCTION analytics_content_leaderboard(
  p_since      timestamptz,
  p_event_type text
)
RETURNS TABLE (
  item_id text,
  title   text,
  creator text,
  url     text,
  count   int
)
LANGUAGE plpgsql SECURITY DEFINER VOLATILE AS $$
BEGIN
  RETURN QUERY
  SELECT
    MAX(ae.meta->>'item_id'),
    MAX(COALESCE(ae.meta->>'title', ae.meta->>'url', ae.page, '')),
    MAX(ae.meta->>'creator'),
    MAX(ae.meta->>'url'),
    COUNT(ae.*)::int
  FROM public.analytics_events ae
  WHERE ae.created_at >= p_since
    AND ae.event      = p_event_type
  GROUP BY
    COALESCE(
      NULLIF(ae.meta->>'item_id', ''),
      COALESCE(ae.meta->>'title', ae.meta->>'url', ae.page, '')
        || '||' || COALESCE(ae.meta->>'creator', '')
    )
  ORDER BY COUNT(ae.*) DESC
  LIMIT 20;
END;
$$;
