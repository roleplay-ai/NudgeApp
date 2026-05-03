-- ============================================
-- Migration 004: Tools detail fields + Apply tiles redesign
-- Run AFTER migration_003_resources.sql
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

-- Drop old apply structure
drop table if exists public.apply_task_steps cascade;
drop table if exists public.apply_tasks cascade;

-- Apply tiles (25 tiles: Features / Apps / Workflows / Skills)
create table public.apply_tiles (
  id uuid primary key default gen_random_uuid(),
  title text not null,                 -- "CANVAS", "GEMS", etc.
  subtitle text not null,              -- "Edit AI replies inline"
  group_name text not null check (group_name in ('Features', 'Apps', 'Workflows', 'Skills')),
  is_featured boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Apply slides (variable count per tile)
create table public.apply_slides (
  id uuid primary key default gen_random_uuid(),
  tile_id uuid not null references public.apply_tiles(id) on delete cascade,
  title text not null,                 -- slide title (above image)
  body text not null,                  -- explanatory text (below image)
  image_url text,                      -- admin-uploaded screenshot
  order_index int not null default 0,
  created_at timestamptz default now()
);

-- Trending hero (shown on home page)
create table public.trending (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  body text not null,
  why_it_matters text,
  emoji text,
  color text default '#623CEA',
  is_active boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.apply_tiles enable row level security;
alter table public.apply_slides enable row level security;
alter table public.trending enable row level security;

create policy "anyone reads apply tiles" on public.apply_tiles for select using (true);
create policy "admin writes apply tiles" on public.apply_tiles for all using (public.is_admin());

create policy "anyone reads apply slides" on public.apply_slides for select using (true);
create policy "admin writes apply slides" on public.apply_slides for all using (public.is_admin());

create policy "anyone reads trending" on public.trending for select using (true);
create policy "admin writes trending" on public.trending for all using (public.is_admin());
