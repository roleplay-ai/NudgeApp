-- ============================================================
-- Migration 033: User XP percentile helper
--
-- Adds `get_user_top_percent(uuid)` so the UI can render something
-- like "You are in top 12%" next to the points card without leaking
-- other users' rows to the client.
--
-- Why an RPC instead of a client query?
--   `public.profiles` is meant to stay locked down by RLS to a user's
--   own row. To compute a global percentile we need to count *all*
--   users, which is exactly what a `security definer` function lets
--   us do while still returning only one safe number.
--
-- Definition we picked: "top X%" means the share of users with
-- strictly higher XP than the caller. So the all-time leader is in
-- top 1%, and ties at the top don't push anyone down. We also clamp
-- to a minimum of 1 so the badge never reads "top 0%".
--
-- The supporting index keeps the count cheap even as profiles grows.
-- ============================================================

create index if not exists profiles_xp_idx on public.profiles (xp desc);

create or replace function public.get_user_top_percent(p_user uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select xp from public.profiles where id = p_user
  ),
  stats as (
    select
      count(*)                                              as total,
      count(*) filter (where xp > (select xp from me))      as ahead
    from public.profiles
  )
  select case
    when total <= 1 then 100
    else greatest(1, ceil((ahead::numeric / total) * 100))::int
  end
  from stats;
$$;

comment on function public.get_user_top_percent(uuid) is
  'Returns the "top X%" bucket for a user based on profiles.xp. Strictly-ahead definition, clamped to 1..100.';

revoke all on function public.get_user_top_percent(uuid) from public;
grant execute on function public.get_user_top_percent(uuid) to authenticated;
