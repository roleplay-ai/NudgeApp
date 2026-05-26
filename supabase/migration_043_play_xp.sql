-- Migration 043: track quiz/play XP separately on profiles
-- play_xp mirrors the net XP delta from quiz completions only,
-- using the same delta-scoring logic as complete_quiz().

-- ── Column ────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS play_xp integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.play_xp IS
  'Running total of XP earned exclusively from quiz (play) completions.';

-- ── Update complete_quiz() to mirror delta into play_xp ───────────────────────

CREATE OR REPLACE FUNCTION complete_quiz(
  p_user   UUID,
  p_quiz   UUID,
  p_points INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev  INT := 0;
  v_delta INT;
BEGIN
  -- Fetch previous best score for this quiz (NULL if first attempt)
  SELECT points_earned INTO v_prev
  FROM   quiz_completions
  WHERE  user_id = p_user
    AND  quiz_id = p_quiz;

  v_prev  := COALESCE(v_prev, 0);
  v_delta := p_points - v_prev;

  -- Upsert: first attempt inserts, re-attempt overwrites score + bumps counter
  INSERT INTO quiz_completions (user_id, quiz_id, points_earned, attempt_count, completed_at)
  VALUES (p_user, p_quiz, p_points, 1, now())
  ON CONFLICT (user_id, quiz_id) DO UPDATE
    SET points_earned = EXCLUDED.points_earned,
        attempt_count = quiz_completions.attempt_count + 1,
        completed_at  = now();

  -- Apply delta to both total xp and play_xp atomically
  IF v_delta <> 0 THEN
    UPDATE profiles
    SET    xp      = GREATEST(0, xp      + v_delta),
           play_xp = GREATEST(0, play_xp + v_delta)
    WHERE  id = p_user;
  END IF;

  RETURN v_delta;
END;
$$;

-- ── Backfill play_xp from existing quiz_completions ───────────────────────────
-- quiz_completions.points_earned holds the best score per (user, quiz),
-- so summing across all quizzes gives the correct accumulated play XP.

UPDATE public.profiles p
SET    play_xp = COALESCE((
  SELECT SUM(qc.points_earned)
  FROM   quiz_completions qc
  WHERE  qc.user_id = p.id
), 0);
