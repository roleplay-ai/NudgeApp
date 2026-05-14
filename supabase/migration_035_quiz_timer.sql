-- migration_035_quiz_timer.sql
-- Adds a per-quiz countdown timer.
-- Allowed values: 5 | 10 | 15 | 20 | 25 | 30 seconds.
-- All questions within a quiz share the same timer duration.

ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS time_per_question INT NOT NULL DEFAULT 15
    CHECK (time_per_question IN (5, 10, 15, 20, 25, 30));
