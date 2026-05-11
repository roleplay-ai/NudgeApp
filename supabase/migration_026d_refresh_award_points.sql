-- ============================================================
-- Migration 026d: Refresh award_points() — kill stale overloads
-- ============================================================
-- Symptom this fixes:
--   awardPointsAction RPC returns: column "last_active_date" does not exist
--   even though `profiles.last_active_date` clearly exists in the table.
--
-- Cause: an older version of `public.award_points(...)` is still resident
-- in the database (different argument list, or compiled before the column
-- was added). Supabase RPC routes by signature, so the stale overload can
-- fire instead of the one migration_026 defines.
--
-- Fix: drop every overload, then recreate from scratch. This is safe to
-- re-run; the function body is identical to migration_026's definition.
-- Must run AFTER migration_026b (which guarantees `last_active_date` exists).
-- ============================================================

-- 1. Belt-and-braces: ensure the column the function targets is present.
alter table public.profiles add column if not exists last_active_date date;

-- 2. Drop every existing overload of award_points so a stale one can't win.
do $$
declare
  r record;
begin
  for r in
    select  p.oid::regprocedure::text as sig
    from    pg_proc p
    join    pg_namespace n on n.oid = p.pronamespace
    where   n.nspname = 'public'
      and   p.proname  = 'award_points'
  loop
    execute format('drop function %s', r.sig);
  end loop;
end $$;

-- 3. Recreate the canonical function (identical body to migration_026).
create function public.award_points(
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

  perform 1 from public.profiles where id = p_user for update;
  if not found then
    return;
  end if;

  insert into public.point_transactions
    (user_id, source_type, source_id, idempotency_key, points)
  values
    (p_user, p_source_type, p_source_id, p_idempotency_key, p_points)
  on conflict do nothing
  returning true into v_inserted;

  if v_inserted is null then
    return;
  end if;

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
