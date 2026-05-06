-- Example rich content for Canvas tile (run after migration_009_apply_tile_detail.sql)

update public.apply_tiles
set
  title = 'Canvas',
  icon_color = '#A855F7',
  category_tag = 'Editing',
  what_it_does = 'Canvas opens AI''s reply as a side-by-side editable document. Highlight any line, ask AI to rewrite or shorten it, and watch only that part change. Perfect for long emails, drafts, code, and reports where you want surgical edits — not a full rewrite.',
  video_url = null,
  available_in = '[
    {"name": "ChatGPT", "color": "#23CE68"},
    {"name": "Claude", "color": "#F68A29"}
  ]'::jsonb
where upper(trim(title)) = 'CANVAS';
