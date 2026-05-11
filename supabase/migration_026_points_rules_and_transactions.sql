-- ============================================================
-- Migration 026: Points — rules, transactions, award_points()
-- ============================================================
-- point_rules         : admin-configurable default points per content type
-- point_transactions  : append-only audit log of every XP grant (idempotent)
-- profiles.xp         : running total kept in sync by award_points()
-- award_points()      : SECURITY DEFINER function — single chokepoint
--                       for granting XP. Also updates streak.
--                       (Badge awarding is added in migration_032.)
-- ============================================================

-- 1. RULES ----------------------------------------------------
create table if not exists public.point_rules (
  id             uuid primary key default gen_random_uuid(),
  content_type   text not null unique,
  default_points int  not null check (default_points >= 0),
  updated_at     timestamptz default now(),
  updated_by     uuid references public.profiles(id) on delete set null
);

comment on table public.point_rules is
  'Admin-edited default points per content type. Overridden per-item by *.points_award.';

-- Seed sensible defaults.
insert into public.point_rules (content_type, default_points) values
  ('module',         50),
  ('video',          10),
  ('news',            5),
  ('apply_video',    15),
  ('quiz_question',  10)
on conflict (content_type) do nothing;

-- 2. TRANSACTIONS ---------------------------------------------
create table if not exists public.point_transactions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles(id) on delete set null,
  source_type       text not null,
  source_id         uuid not null,
  idempotency_key   text,
  points            int  not null,
  awarded_at        timestamptz default now()
);

-- One-shot grants: (user, source_type, source_id, idempotency_key) is unique.
-- NULLS NOT DISTINCT (PG15+) so a null idempotency_key still blocks duplicates.
create unique index if not exists point_transactions_uniq
  on public.point_transactions (user_id, source_type, source_id, idempotency_key)
  nulls not distinct;

create index if not exists point_transactions_user_awarded_idx
  on public.point_transactions (user_id, awarded_at desc);

comment on table public.point_transactions is
  'Append-only audit log of XP grants. Uniqueness enforces idempotency.';
comment on column public.point_transactions.idempotency_key is
  'Optional key for repeating sources (e.g. weekly streak: ''streak:2026-W19'').';

-- 3. PER-ITEM OVERRIDES --------------------------------------
-- Note: in this database the real tables are `news_items` (not `news`)
-- and `watch_videos` (not `videos`). The point_rules.content_type
-- keys ('video', 'news', ...) remain the short logical names used
-- everywhere else in the app.
alter table public.modules        add column if not exists points_award int;
alter table public.watch_videos   add column if not exists points_award int;
alter table public.news_items     add column if not exists points_award int;
alter table public.apply_videos   add column if not exists points_award int;

comment on column public.modules.points_award        is 'Per-item override; null → use point_rules(''module'').';
comment on column public.watch_videos.points_award   is 'Per-item override; null → use point_rules(''video'').';
comment on column public.news_items.points_award     is 'Per-item override; null → use point_rules(''news'').';
comment on column public.apply_videos.points_award   is 'Per-item override; null → use point_rules(''apply_video'').';

-- 4. award_points() ------------------------------------------
-- Single chokepoint: locks the profile row, inserts a transaction
-- (idempotent), increments xp, updates streak.
-- Badge-awarding is added by migration_032 (CREATE OR REPLACE).
create or replace function public.award_points(
  p_user             uuid,
  p_source_type      text,
  p_source_id        uuid,
  p_points           int,
  p_idempotency_key  text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted bool;
begin
  if p_user is null or p_points is null or p_points <= 0 then
    return;
  end if;

  -- Lock the profile row to serialize concurrent awards for this user.
  perform 1 from public.profiles where id = p_user for update;
  if not found then
    return;
  end if;

  -- Insert audit row; if a duplicate, exit silently (idempotent no-op).
  insert into public.point_transactions
    (user_id, source_type, source_id, idempotency_key, points)
  values
    (p_user, p_source_type, p_source_id, p_idempotency_key, p_points)
  on conflict do nothing
  returning true into v_inserted;

  if v_inserted is null then
    return;
  end if;

  -- Increment xp and update streak in the same locked window.
  update public.profiles
     set xp = xp + p_points,
         streak = case
           when last_active_date = current_date     then streak
           when last_active_date = current_date - 1 then streak + 1
           else 1
         end,
         last_active_date = current_date
   where id = p_user;
end;
$$;

revoke all on function public.award_points(uuid, text, uuid, int, text) from public;
grant execute on function public.award_points(uuid, text, uuid, int, text) to authenticated, service_role;

-- 5. RLS ------------------------------------------------------
alter table public.point_rules         enable row level security;
alter table public.point_transactions  enable row level security;

create policy "anyone reads point rules" on public.point_rules
  for select using (true);
create policy "admin writes point rules" on public.point_rules
  for all using (public.is_admin());

create policy "users read own point transactions" on public.point_transactions
  for select using (auth.uid() = user_id or public.is_admin());
-- INSERT only via award_points() (SECURITY DEFINER); no policy allows direct INSERT.
create policy "admin deletes point transactions" on public.point_transactions
  for delete using (public.is_admin());
