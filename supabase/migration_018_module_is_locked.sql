-- ============================================================
-- Migration 018: Add is_locked column to modules table
-- Run this in the Supabase SQL Editor.
--
-- is_locked = true  → module is locked and cannot be started
--                     (shown with a lock icon on the Learn page)
-- is_locked = false → module is available (default)
-- ============================================================

alter table public.modules
  add column if not exists is_locked boolean not null default false;

comment on column public.modules.is_locked is
  'When true the module is visible on the Learn page but locked — users see a padlock and cannot start it.';
