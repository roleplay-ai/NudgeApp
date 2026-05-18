-- Rubrics are now defined inside the assessment_prompt text, not as separate DB rows.
-- practice_scores no longer needs a FK to practice_rubrics; store the criterion name and max inline.

ALTER TABLE practice_scores
  ADD COLUMN IF NOT EXISTS rubric_name text,
  ADD COLUMN IF NOT EXISTS max_score   integer,
  ALTER COLUMN rubric_id DROP NOT NULL;
