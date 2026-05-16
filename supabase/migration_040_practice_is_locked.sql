-- migration_040_practice_is_locked.sql
-- 1. Adds is_locked to practice_activities (mirrors quizzes / modules pattern).
--    is_locked = true  → activity requires login; shown with padlock for guests.
--    is_locked = false → activity is accessible to everyone (default).
-- 2. Drops sort_order from practice_rubrics — rubrics are now ordered by insertion (created_at).

ALTER TABLE public.practice_activities
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.practice_activities.is_locked IS
  'When true the activity is visible but locked for guests — users must log in to start it.';

ALTER TABLE public.practice_rubrics
  DROP COLUMN IF EXISTS sort_order;
