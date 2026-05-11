-- ============================================================
-- Migration 025: Lockable content
-- Adds is_locked boolean to remaining catalog tables.
-- modules already has is_locked (migration_018).
--
-- is_locked is a UI gating hint, NOT a security boundary.
-- Anonymous users can still read locked rows; the app shows
-- a padlock + "Login to unlock" CTA. This preserves SEO and
-- link-sharing for locked items.
--
-- Note on table names in this database:
--   * news       lives in  public.news_items
--   * videos     lives in  public.watch_videos
-- ============================================================

alter table public.worlds         add column if not exists is_locked boolean not null default false;
alter table public.watch_videos   add column if not exists is_locked boolean not null default false;
alter table public.news_items     add column if not exists is_locked boolean not null default false;
alter table public.tools          add column if not exists is_locked boolean not null default false;
alter table public.resources      add column if not exists is_locked boolean not null default false;
alter table public.apply_videos   add column if not exists is_locked boolean not null default false;

comment on column public.worlds.is_locked        is 'UI gating flag; users see a padlock until logged in.';
comment on column public.watch_videos.is_locked  is 'UI gating flag; users see a padlock until logged in.';
comment on column public.news_items.is_locked    is 'UI gating flag; users see a padlock until logged in.';
comment on column public.tools.is_locked         is 'UI gating flag; users see a padlock until logged in.';
comment on column public.resources.is_locked     is 'UI gating flag; users see a padlock until logged in.';
comment on column public.apply_videos.is_locked  is 'UI gating flag; users see a padlock until logged in.';

-- Distinguish news items from longer-form articles without creating a separate table.
alter table public.news_items
  add column if not exists kind text not null default 'news'
  check (kind in ('news','article'));

comment on column public.news_items.kind is
  'Row type: news (short update) or article (long-form). The user_content_interactions row uses content_type=''news'' for both.';
