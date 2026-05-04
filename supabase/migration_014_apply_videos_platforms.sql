-- Optional explicit platforms for Apply video modal ("Available in" chips).
-- Prefer this over embedding "Platforms: A | B" in description.
ALTER TABLE public.apply_videos ADD COLUMN IF NOT EXISTS platforms text;

COMMENT ON COLUMN public.apply_videos.platforms IS 'Pipe- or comma-separated tool names, e.g. ChatGPT | Claude | Gemini (shown in user modal)';
