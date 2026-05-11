-- ============================================================
-- Migration 024: Housekeeping — fix legacy migrations
-- Run this in the Supabase SQL Editor BEFORE migrations 025+.
--
-- Two prior migrations referenced tables that don't exist:
--   * migration_020_news_brief.sql referred to public.news_items
--     (the real table is public.news).
--   * migration_016_home_weekly_watch_videos.sql referenced
--     public.watch_videos (the real table is public.videos).
--
-- This migration is idempotent — safe to re-run.
-- ============================================================

-- Add brief column to the real news table (was wrongly aimed at news_items).
alter table public.news
  add column if not exists brief text;

comment on column public.news.brief is
  'Short teaser line shown above the full body on the Today tab.';

-- Repair the home_weekly_watch_videos FK so it points at public.videos.
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'home_weekly_watch_videos'
      and constraint_name = 'home_weekly_watch_videos_watch_video_id_fkey'
  ) then
    alter table public.home_weekly_watch_videos
      drop constraint home_weekly_watch_videos_watch_video_id_fkey;
  end if;
exception when undefined_table then
  -- table itself doesn't exist; nothing to do.
  null;
end$$;

do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'home_weekly_watch_videos')
     and exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'home_weekly_watch_videos'
                   and column_name = 'watch_video_id')
  then
    alter table public.home_weekly_watch_videos
      add constraint home_weekly_watch_videos_video_fk
      foreign key (watch_video_id) references public.videos(id) on delete cascade;
  end if;
exception when duplicate_object then null;
end$$;
