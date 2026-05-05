-- ============================================
-- Home black card ("Nudgeable Brief" hero) — admin-editable copy
-- Run in Supabase → SQL Editor.
-- ============================================

CREATE TABLE IF NOT EXISTS public.home_brief_hero (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_label text NOT NULL DEFAULT 'NUDGEABLE BRIEF',
  title text NOT NULL,
  subtitle text NOT NULL,
  byline_override text,
  byline_suffix text NOT NULL DEFAULT 'Nudgeable Editorial',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_brief_hero ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads home brief hero" ON public.home_brief_hero;
DROP POLICY IF EXISTS "admin writes home brief hero" ON public.home_brief_hero;

CREATE POLICY "anyone reads home brief hero"
ON public.home_brief_hero FOR SELECT
USING (true);

CREATE POLICY "admin writes home brief hero"
ON public.home_brief_hero FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

INSERT INTO public.home_brief_hero (badge_label, title, subtitle, byline_suffix)
SELECT
  'NUDGEABLE BRIEF',
  'What changed in AI — fast',
  'Three headlines worth your attention — curated, plain English, links when you want more.',
  'Nudgeable Editorial'
WHERE NOT EXISTS (SELECT 1 FROM public.home_brief_hero LIMIT 1);
