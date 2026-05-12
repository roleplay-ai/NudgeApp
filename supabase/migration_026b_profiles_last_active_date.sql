-- ============================================================
-- Migration 026b: profiles.last_active_date (streak bookkeeping)
-- ============================================================
-- If you ran migration 026 before `profiles.last_active_date` was added there,
-- `award_points()` fails with: column "last_active_date" does not exist.
-- This migration is idempotent — safe even when 026 already added the column.
-- Run after migration_026, before relying on streak updates from award_points().
-- ============================================================

alter table public.profiles add column if not exists last_active_date date;

comment on column public.profiles.last_active_date is
  'UTC calendar date when XP was last granted; daily streak resets when this gaps.';
