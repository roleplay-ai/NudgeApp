-- ============================================================
-- Migration 026c: Drop legacy profiles.last_active column
-- ============================================================
-- Older schema iterations shipped `profiles.last_active` (text/date).
-- Migration 026 introduced `profiles.last_active_date` (date) and
-- award_points() writes only to that column. Some live databases now
-- carry both — `last_active` is dead weight (no readers in app code,
-- no writers in any current migration).
--
-- This migration removes the legacy column. Run AFTER migration_026b
-- so award_points() never loses its target column mid-deploy.
--
-- Idempotent: `drop column if exists` is a no-op when the column is
-- already gone (e.g. fresh databases built from current schema.sql).
-- ============================================================

alter table public.profiles drop column if exists last_active;
