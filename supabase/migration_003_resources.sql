-- ============================================
-- Migration: Add resources (external learning links)
-- Run in Supabase SQL Editor AFTER migration_002_worlds.sql
-- ============================================

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text,                    -- "Anthropic", "OpenAI", "Google"
  description text,
  url text not null,
  category text not null,           -- 'Academy' | 'Tutorials' | 'Courses' | 'Use Cases' | 'Newsletter' | 'Other'
  logo_url text,                    -- admin-uploaded logo or icon url
  is_featured boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

alter table public.resources enable row level security;

create policy "anyone reads resources" on public.resources for select using (true);
create policy "admin writes resources" on public.resources for all using (public.is_admin());
