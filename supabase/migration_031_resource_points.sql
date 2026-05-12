-- ============================================================
-- Migration 031: Award points for engagement clicks
--
-- Adds the `resource` content type to point_rules so users can earn
-- XP when they click through a Learning resource (or article row that
-- still lives on the `resources` table) from the Library hub.
--
-- Also adds the per-item `points_award` override column to `resources`
-- so admins can tune individual rows the same way they can for
-- modules / watch_videos / news_items / apply_videos.
--
-- Watch videos already have a `video` rule (10 XP) and articles in the
-- `news_items` table are covered by the `news` rule (5 XP) — no schema
-- change needed there; this migration only adds what's missing.
-- ============================================================

-- 1. New default for "resource"
insert into public.point_rules (content_type, default_points) values
  ('resource', 5)
on conflict (content_type) do nothing;

-- 2. Per-item override on resources
alter table public.resources add column if not exists points_award int;
comment on column public.resources.points_award is
  'Per-item override; null → use point_rules(''resource'').';
