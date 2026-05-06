-- ============================================
-- Analytics events — anonymous, fire-and-forget page views + click tracking
-- Run in Supabase → SQL Editor.
-- ============================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigserial PRIMARY KEY,
  event text NOT NULL,        -- 'page_view' | 'news_click' | 'video_click' | 'product_click' | 'link_click' | ...
  page text,                  -- URL path, e.g. '/learn'
  ref text,                   -- document.referrer (optional)
  meta jsonb,                 -- { item_id, title, url, ... } — free-form extra context
  visitor_id uuid,            -- anonymous UUID stored in sessionStorage (rotates each browser session)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx     ON public.analytics_events (event);
CREATE INDEX IF NOT EXISTS analytics_events_page_idx      ON public.analytics_events (page);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone inserts analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "admin reads analytics events"    ON public.analytics_events;

-- Any visitor (logged in or anonymous) can INSERT
CREATE POLICY "anyone inserts analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "admin reads analytics events"
ON public.analytics_events FOR SELECT
USING (public.is_admin());
