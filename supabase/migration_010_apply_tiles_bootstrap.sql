-- ============================================
-- Bootstrap: create public.apply_tiles when missing
-- ============================================
-- Use this if you see: relation "public.apply_tiles" does not exist
-- (e.g. migration_004 was never applied, but you ran migration_009).
--
-- Safe to re-run: CREATE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS.
-- After this, run seed_004_apply_tiles.sql (optional) and seed_009_apply_tile_canvas.sql (optional).
-- ============================================

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

-- Detail columns (same as migration_009_apply_tile_detail.sql)
alter table public.apply_tiles add column if not exists icon_url text;
alter table public.apply_tiles add column if not exists icon_color text;
alter table public.apply_tiles add column if not exists category_tag text;
alter table public.apply_tiles add column if not exists what_it_does text;
alter table public.apply_tiles add column if not exists video_url text;
alter table public.apply_tiles add column if not exists available_in jsonb default '[]'::jsonb;

-- Ensure NOT NULL + default for existing rows (if column was added nullable in older PG paths)
update public.apply_tiles set available_in = '[]'::jsonb where available_in is null;
alter table public.apply_tiles alter column available_in set default '[]'::jsonb;
alter table public.apply_tiles alter column available_in set not null;

-- Slides table (only if missing — skips if you already have apply_slides)
create table if not exists public.apply_slides (
  id uuid primary key default gen_random_uuid(),
  tile_id uuid not null references public.apply_tiles(id) on delete cascade,
  title text not null,
  body text not null,
  image_url text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

alter table public.apply_tiles enable row level security;
alter table public.apply_slides enable row level security;

drop policy if exists "anyone reads apply tiles" on public.apply_tiles;
drop policy if exists "admin writes apply tiles" on public.apply_tiles;
create policy "anyone reads apply tiles" on public.apply_tiles for select using (true);
create policy "admin writes apply tiles" on public.apply_tiles for all using (public.is_admin());

drop policy if exists "anyone reads apply slides" on public.apply_slides;
drop policy if exists "admin writes apply slides" on public.apply_slides;
create policy "anyone reads apply slides" on public.apply_slides for select using (true);
create policy "admin writes apply slides" on public.apply_slides for all using (public.is_admin());
