-- ============================================================
-- Playbook schema additions for nudgeable's Supabase project
-- Run this once in the Supabase SQL Editor.
-- This lets the AI Playbook app share nudgeable's auth + DB.
-- ============================================================

-- 1. Companies (workshop facilitator orgs)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Extend profiles with Playbook-specific columns
-- (nudgeable's existing profiles table keeps all its columns;
--  these are added as nullable so existing rows are unaffected)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 3. Activities (user's work tasks mapped to AI capabilities)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  categories TEXT[] NOT NULL DEFAULT '{}',
  ai_capabilities TEXT[] NOT NULL DEFAULT '{}',
  weekly_hours NUMERIC NOT NULL DEFAULT 0,
  ai_capable TEXT NOT NULL DEFAULT 'yes',
  recommended_tool TEXT,
  how_to TEXT,
  hours_saved NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 4. Commitments (user goals / action items from the playbook)
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, position)
);
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- 5. Helper function used by Playbook RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = _uid), false);
$$;

-- 6. RLS: companies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'companies_select_authenticated') THEN
    CREATE POLICY "companies_select_authenticated" ON public.companies
      FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'companies_admin_all') THEN
    CREATE POLICY "companies_admin_all" ON public.companies
      FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 7. RLS: activities
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'activities_select_own_or_admin') THEN
    CREATE POLICY "activities_select_own_or_admin" ON public.activities
      FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'activities_insert_own') THEN
    CREATE POLICY "activities_insert_own" ON public.activities
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'activities_update_own') THEN
    CREATE POLICY "activities_update_own" ON public.activities
      FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'activities_delete_own_or_admin') THEN
    CREATE POLICY "activities_delete_own_or_admin" ON public.activities
      FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;
END $$;

-- 8. RLS: commitments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'commitments_select_own_or_admin') THEN
    CREATE POLICY "commitments_select_own_or_admin" ON public.commitments
      FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'commitments_insert_own') THEN
    CREATE POLICY "commitments_insert_own" ON public.commitments
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'commitments_update_own') THEN
    CREATE POLICY "commitments_update_own" ON public.commitments
      FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commitments' AND policyname = 'commitments_delete_own') THEN
    CREATE POLICY "commitments_delete_own" ON public.commitments
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- 9. updated_at trigger for activities
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS activities_touch ON public.activities;
CREATE TRIGGER activities_touch
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 10. Seed default companies
INSERT INTO public.companies (name) VALUES ('Flipkart'), ('ICICI'), ('Demo Co')
ON CONFLICT (name) DO NOTHING;
