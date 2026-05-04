-- Optional hint shown on Apply feature cards (e.g. ~1 min). Safe to re-run.
ALTER TABLE public.apply_tiles ADD COLUMN IF NOT EXISTS estimated_duration text;

COMMENT ON COLUMN public.apply_tiles.estimated_duration IS 'Short duration label on the card (e.g. ~1 min); informational only';
