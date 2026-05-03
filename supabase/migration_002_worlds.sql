-- ============================================
-- Migration: Replace lessons/questions with
-- worlds → modules → screens (card flow)
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- Drop old lesson tables (cascades to user_progress.lesson_id refs)
alter table public.user_progress drop column if exists lesson_id;
drop table if exists public.questions cascade;
drop table if exists public.lessons cascade;

-- Add module-based progress reference
alter table public.user_progress add column if not exists module_id uuid;

-- 1. WORLDS (top-level groupings — "What is AI?", "How GenAI reads language", etc)
create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  emoji text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

-- 2. MODULES (e.g., "AI vs ML vs Deep Learning")
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  title text not null,
  description text,
  concepts text[] default '{}',  -- ["Tokens", "Tokenization"]
  order_index int not null default 0,
  next_module_hint text,          -- "Next up: How AI finds meaning"
  created_at timestamptz default now()
);

-- 3. SCREENS (6 swipeable screens per module)
create table public.module_screens (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  screen_type text not null check (screen_type in ('hook','idea','example','why','check','unlocked')),
  label text,                     -- "HOOK", "THE IDEA", etc
  title text,
  body text,
  -- example screens
  examples jsonb,                 -- [{ tone: 'good'|'bad'|'neutral', label, text, tokens: [...] }]
  caption text,
  -- check screens
  question text,
  options jsonb,                  -- ["A","B","C"]
  correct_index int,
  feedback text,
  -- unlocked
  next_text text,
  order_index int not null default 0
);

-- Add module link to user_progress
alter table public.user_progress
  add constraint user_progress_module_fk
  foreign key (module_id) references public.modules(id) on delete set null;

-- ============================================
-- RLS
-- ============================================
alter table public.worlds enable row level security;
alter table public.modules enable row level security;
alter table public.module_screens enable row level security;

create policy "anyone reads worlds" on public.worlds for select using (true);
create policy "admin writes worlds" on public.worlds for all using (public.is_admin());

create policy "anyone reads modules" on public.modules for select using (true);
create policy "admin writes modules" on public.modules for all using (public.is_admin());

create policy "anyone reads module screens" on public.module_screens for select using (true);
create policy "admin writes module screens" on public.module_screens for all using (public.is_admin());
