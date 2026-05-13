-- migration_034_quizzes.sql
-- Standalone quiz system: admin-created MCQ quizzes with per-question and
-- completion-bonus points, lock/unlock gating, and guest-friendly play.

-- ── Quizzes ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quizzes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  description      TEXT,
  emoji            TEXT        NOT NULL DEFAULT '🧠',
  color            TEXT        NOT NULL DEFAULT '#623CEA',
  order_index      INT         NOT NULL DEFAULT 0,
  is_published     BOOLEAN     NOT NULL DEFAULT false,
  is_locked        BOOLEAN     NOT NULL DEFAULT false,
  points_per_question INT      NOT NULL DEFAULT 10,
  completion_bonus INT         NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quizzes_select_all"
  ON quizzes FOR SELECT USING (true);

CREATE POLICY "quizzes_all_admin"
  ON quizzes FOR ALL USING (is_admin());

-- ── Quiz questions ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_questions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id           UUID        NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question          TEXT        NOT NULL,
  feedback_correct  TEXT        NOT NULL DEFAULT 'Correct!',
  feedback_incorrect TEXT       NOT NULL DEFAULT 'Not quite — the correct answer is highlighted above.',
  order_index       INT         NOT NULL DEFAULT 0,
  points_award      INT,        -- NULL means inherit quiz.points_per_question
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_select_all"
  ON quiz_questions FOR SELECT USING (true);

CREATE POLICY "quiz_questions_all_admin"
  ON quiz_questions FOR ALL USING (is_admin());

-- ── Quiz options ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quiz_options (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID    NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text  TEXT    NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT false,
  order_index  INT     NOT NULL DEFAULT 0
);

ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_options_select_all"
  ON quiz_options FOR SELECT USING (true);

CREATE POLICY "quiz_options_all_admin"
  ON quiz_options FOR ALL USING (is_admin());

-- ── Point rules seed for quiz source types ────────────────────────────────────
-- quiz_question already seeded by migration_026; add quiz (completion) type.

INSERT INTO point_rules (content_type, default_points)
VALUES ('quiz', 0)
ON CONFLICT (content_type) DO NOTHING;
