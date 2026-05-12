-- ============================================================
-- Migration 029: Login coupons
-- ============================================================
-- A single code shared by all logged-in users. Admin can rotate
-- via the is_active flag + validity window. RLS makes sure users
-- can read ONLY currently-valid coupons (no scraping future codes).
-- ============================================================

create table if not exists public.coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  discount_percent  int check (discount_percent between 0 and 100),
  valid_from        timestamptz not null default now(),
  valid_until       timestamptz,
  is_active         boolean not null default true,
  created_at        timestamptz default now()
);

comment on table public.coupons is
  'Shared login discount codes. App picks the most recent active row whose validity window contains now().';

create index if not exists coupons_active_window_idx
  on public.coupons (is_active, valid_from, valid_until);

alter table public.coupons enable row level security;

-- Authenticated users see only active, currently-valid coupons.
create policy "auth users read active coupons" on public.coupons
  for select using (
    auth.uid() is not null
    and is_active
    and now() >= valid_from
    and (valid_until is null or now() <= valid_until)
  );

-- Admin sees and edits everything.
create policy "admin reads all coupons" on public.coupons
  for select using (public.is_admin());
create policy "admin writes coupons" on public.coupons
  for all using (public.is_admin());
