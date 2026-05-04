-- Apply tiles: detail fields for card + modal (what it does, video, platforms, category pill)
-- Prerequisite: table public.apply_tiles must exist.
-- If you get "relation apply_tiles does not exist", run migration_010_apply_tiles_bootstrap.sql first (then re-run this file if 010 did not already add these columns).

alter table public.apply_tiles
  add column if not exists icon_url text,
  add column if not exists icon_color text,
  add column if not exists category_tag text,
  add column if not exists what_it_does text,
  add column if not exists video_url text,
  add column if not exists available_in jsonb not null default '[]'::jsonb;

comment on column public.apply_tiles.category_tag is 'Small pill on card e.g. EDITING, PERSONAL (separate from group_name)';
comment on column public.apply_tiles.what_it_does is 'Long copy for modal "What it does" section';
comment on column public.apply_tiles.video_url is 'YouTube or other embeddable watch URL';
comment on column public.apply_tiles.available_in is 'JSON array: [{"name":"ChatGPT","color":"#23CE68"}, ...]';
