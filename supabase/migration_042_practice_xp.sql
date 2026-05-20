-- Migration 042: track practice XP separately on profiles
-- practice_xp mirrors the net XP delta from practice activity submissions only.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS practice_xp integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.practice_xp IS
  'Running total of XP earned exclusively from practice activity submissions.';

-- Lightweight helper called by the submit API after complete_practice() succeeds.
-- Receives the same net delta so practice_xp stays in sync with how xp was updated.
CREATE OR REPLACE FUNCTION public.add_practice_xp(
  p_user  uuid,
  p_delta integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user IS NULL OR p_delta IS NULL OR p_delta = 0 THEN
    RETURN;
  END IF;

  UPDATE public.profiles
     SET practice_xp = GREATEST(0, practice_xp + p_delta)
   WHERE id = p_user;
END;
$$;

REVOKE ALL ON FUNCTION public.add_practice_xp(uuid, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.add_practice_xp(uuid, integer) TO authenticated, service_role;
