-- ============================================================
-- Migration 032: Award points for clicking through to a Tool
--
-- Mirrors migration_031 (resources): adds a `tool` content type
-- to point_rules and a per-item `points_award` override column on
-- the `tools` table so admins can boost specific tools.
--
-- The user-visible click that earns points is the "Try {tool.name}"
-- button inside ToolModal — i.e. the moment the user leaves us to
-- check out the tool. Idempotency is enforced by award_points()
-- so repeat clicks don't grant extra XP.
-- ============================================================

insert into public.point_rules (content_type, default_points) values
  ('tool', 5)
on conflict (content_type) do nothing;

alter table public.tools add column if not exists points_award int;
comment on column public.tools.points_award is
  'Per-item override; null → use point_rules(''tool'').';
