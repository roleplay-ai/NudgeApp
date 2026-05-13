-- migration_036_quiz_completions.sql
-- Tracks one completion record per (user, quiz).
-- complete_quiz() handles first attempt (full award) and re-attempts (delta award),
-- so the running total in profiles.xp always reflects the user's latest score.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_completions (
  user_id       UUID        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  quiz_id       UUID        NOT NULL REFERENCES quizzes(id)   ON DELETE CASCADE,
  points_earned INT         NOT NULL DEFAULT 0,
  attempt_count INT         NOT NULL DEFAULT 1,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quiz_id)
);

ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;

-- Users may read their own records; admins can read all
CREATE POLICY "qc_select_own"
  ON quiz_completions FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Only the complete_quiz() SECURITY DEFINER function writes to this table
CREATE POLICY "qc_insert_self"
  ON quiz_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qc_update_self"
  ON quiz_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- ── RPC ───────────────────────────────────────────────────────────────────────
-- Returns the XP delta that was applied (positive = gained, negative = lost).
-- Caller can show "You improved by +30 pts" or "Score dropped by 10 pts" etc.

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

  -- Apply delta to XP (GREATEST prevents XP going below 0)
  IF v_delta <> 0 THEN
    UPDATE profiles
    SET    xp = GREATEST(0, xp + v_delta)
    WHERE  id = p_user;
  END IF;

  RETURN v_delta;
END;
$$;
