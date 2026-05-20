-- migration_039_practice_completions.sql
-- Mirrors quiz_completions pattern for practice activities.
-- complete_practice() handles first attempt (full award) and re-attempts (delta),
-- so profiles.xp always reflects the user's latest proportional score.

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS practice_completions (
  user_id      UUID        NOT NULL REFERENCES profiles(id)           ON DELETE CASCADE,
  activity_id  UUID        NOT NULL REFERENCES practice_activities(id) ON DELETE CASCADE,
  xp_earned    INT         NOT NULL DEFAULT 0,
  attempt_count INT        NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_id)
);

ALTER TABLE practice_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pc_select_own" ON practice_completions FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "pc_insert_self" ON practice_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pc_update_self" ON practice_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- ── RPC ───────────────────────────────────────────────────────────────────────
-- p_xp: the XP to award for this attempt (caller computes proportional value).
-- Returns the XP delta applied (positive = gained, negative = lost on re-attempt).

CREATE OR REPLACE FUNCTION complete_practice(
  p_user     UUID,
  p_activity UUID,
  p_xp       INT
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
  -- Previous best XP for this activity (NULL = first attempt)
  SELECT xp_earned INTO v_prev
  FROM   practice_completions
  WHERE  user_id = p_user AND activity_id = p_activity;

  v_prev  := COALESCE(v_prev, 0);
  v_delta := p_xp - v_prev;

  -- Upsert: first attempt inserts, re-attempts overwrite and bump counter
  INSERT INTO practice_completions (user_id, activity_id, xp_earned, attempt_count, completed_at)
  VALUES (p_user, p_activity, p_xp, 1, now())
  ON CONFLICT (user_id, activity_id) DO UPDATE
    SET xp_earned    = EXCLUDED.xp_earned,
        attempt_count = practice_completions.attempt_count + 1,
        completed_at  = now();

  -- Apply delta to XP (GREATEST prevents going below 0)
  IF v_delta <> 0 THEN
    UPDATE profiles
    SET    xp = GREATEST(0, xp + v_delta)
    WHERE  id = p_user;
  END IF;

  RETURN v_delta;
END;
$$;

REVOKE ALL ON FUNCTION complete_practice(UUID, UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_practice(UUID, UUID, INT) TO authenticated, service_role;
