-- ============================================
-- Migration 004: Tools detail fields + Apply tiles (non-destructive)
-- Run AFTER migration_003_resources.sql
-- ============================================
-- Compatible with databases that still use legacy Apply:
--   public.apply_tasks + public.apply_slides (task_id → apply_tasks).
-- This migration does NOT drop apply_tasks, apply_slides, or user_task_progress targets.
--
-- Creates public.apply_tiles when missing (detail columns come from migration_009 / 010).
-- Tile gallery slides live in public.apply_tile_slides (see migration_010), not apply_slides.
--
-- Home hero: public.trending_topics (matches app code), not public.trending.
-- ============================================

-- Extend tools with detailed fields for tool modal popup
alter table public.tools add column if not exists company text;
alter table public.tools add column if not exists founded int;
alter table public.tools add column if not exists pricing text;
alter table public.tools add column if not exists pros text[];
alter table public.tools add column if not exists cons text[];
alter table public.tools add column if not exists best_for text;
alter table public.tools add column if not exists logo_url text;
alter table public.tools add column if not exists color text default '#623CEA';

-- Apply tiles (Features / Apps / Workflows / Skills) — additive only
create table if not exists public.apply_tiles (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  subtitle text not null default '',
  group_name text not null default 'Features'
    check (group_name in ('Features', 'Apps', 'Workflows', 'Skills')),
  is_featured boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Trending hero (app queries trending_topics)
create table if not exists public.trending_topics (
  id uuid primary key default gen_random_uuid(),
  emoji text not null default '🔥',
  title text not null,
  subtitle text,
  body text,
  why_matters text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.apply_tiles enable row level security;
alter table public.trending_topics enable row level security;

drop policy if exists "anyone reads apply tiles" on public.apply_tiles;
drop policy if exists "admin writes apply tiles" on public.apply_tiles;
create policy "anyone reads apply tiles" on public.apply_tiles for select using (true);
create policy "admin writes apply tiles" on public.apply_tiles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone reads trending topics" on public.trending_topics;
drop policy if exists "admin writes trending topics" on public.trending_topics;
create policy "anyone reads trending topics" on public.trending_topics for select using (true);
create policy "admin writes trending topics" on public.trending_topics for all
  using (public.is_admin()) with check (public.is_admin());
