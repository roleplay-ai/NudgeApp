-- Seed: 3 practice activities with rubrics
-- Run this in the Supabase SQL editor

DO $$
DECLARE
  act1 UUID;
  act2 UUID;
  act3 UUID;
BEGIN

-- ── Activity 1: Write a Job Description ─────────────────────────────────────
INSERT INTO practice_activities (
  name, description, category, difficulty,
  time_minutes, xp_reward, icon, color,
  assessment_prompt, hint_chips, is_published, order_index
) VALUES (
  'Write a Job Description',
  'Your startup is hiring a Senior Frontend Engineer. Use the AI to help you write a concise, compelling job description that covers: the role summary, 4–5 key responsibilities, required skills, and one nice-to-have. Keep it under 300 words and avoid corporate jargon.',
  'Text Generation',
  'Easy',
  10, 50, '📝', '#3B82F6',
  'You are an expert prompt engineering assessor evaluating how well a user prompted an AI to produce a high-quality job description. Score fairly based on their prompts, not the AI output quality.

Return ONLY valid JSON in this exact format:
{
  "scores": [
    { "rubric_id": "<rubric id>", "score": <number>, "feedback": "<1–2 sentence feedback>" }
  ]
}',
  ARRAY['Describe the role in one sentence', 'List the required skills', 'Ask for it under 300 words'],
  true, 1
) RETURNING id INTO act1;

INSERT INTO practice_rubrics (activity_id, name, description, max_score, sort_order) VALUES
  (act1, 'Prompt clarity', 'Did the user clearly communicate what they needed from the AI?', 25, 1),
  (act1, 'Specificity', 'Did the user provide enough constraints (word count, tone, structure)?', 25, 2),
  (act1, 'Task completion', 'Did the final output cover all required sections of the job description?', 25, 3),
  (act1, 'Efficiency', 'Did the user achieve a good result in few turns rather than many vague back-and-forths?', 25, 4);


-- ── Activity 2: Customer Support Reply ──────────────────────────────────────
INSERT INTO practice_activities (
  name, description, category, difficulty,
  time_minutes, xp_reward, icon, color,
  assessment_prompt, hint_chips, is_published, order_index
) VALUES (
  'Angry Customer Reply',
  'A customer left a furious review: "I ordered 2 weeks ago and still nothing. Your support team ignored me twice. I want a refund NOW." Use the AI to draft a professional, empathetic reply that acknowledges the frustration, apologises sincerely, offers a concrete resolution, and keeps the customer relationship intact. Tone: warm but professional.',
  'Prompt Engineering',
  'Medium',
  15, 70, '💬', '#F59E0B',
  'You are an expert prompt engineering assessor. Evaluate how effectively the user prompted the AI to produce a high-quality customer support reply. Focus on the quality of their prompting strategy, not the AI output alone.

Return ONLY valid JSON in this exact format:
{
  "scores": [
    { "rubric_id": "<rubric id>", "score": <number>, "feedback": "<1–2 sentence feedback>" }
  ]
}',
  ARRAY['Set the tone in your prompt', 'Specify the resolution to offer', 'Ask for empathy in the opening'],
  true, 2
) RETURNING id INTO act2;

INSERT INTO practice_rubrics (activity_id, name, description, max_score, sort_order) VALUES
  (act2, 'Empathy instruction', 'Did the user prompt the AI to acknowledge the customer''s frustration genuinely?', 25, 1),
  (act2, 'Resolution specificity', 'Did the user tell the AI what concrete resolution to offer (refund, replacement, etc.)?', 25, 2),
  (act2, 'Tone control', 'Did the user guide the AI on tone — warm, professional, not defensive?', 25, 3),
  (act2, 'Completeness', 'Does the final reply cover apology, cause, resolution, and next steps?', 25, 4);


-- ── Activity 3: Data Insight Summary ────────────────────────────────────────
INSERT INTO practice_activities (
  name, description, category, difficulty,
  time_minutes, xp_reward, icon, color,
  assessment_prompt, hint_chips, is_published, order_index
) VALUES (
  'Monthly Sales Insight',
  'You are a data analyst presenting to the CEO. Here is this month''s data: Revenue £124k (up 18% MoM), Top product: Pro Plan (62% of revenue), Churn rate: 4.2% (up from 3.1% last month), New customers: 87, Expansion revenue: £11k. Use the AI to produce a crisp executive summary — 3 key insights, one risk flag, and one recommended action. No more than 150 words.',
  'Data Analytics',
  'Hard',
  20, 90, '📊', '#8B5CF6',
  'You are an expert prompt engineering assessor evaluating how well the user prompted an AI to produce a clear, accurate executive data summary. Score based on prompting quality and output accuracy.

Return ONLY valid JSON in this exact format:
{
  "scores": [
    { "rubric_id": "<rubric id>", "score": <number>, "feedback": "<1–2 sentence feedback>" }
  ]
}',
  ARRAY['Specify the word limit', 'Ask for exactly 3 insights', 'Tell it to flag the churn risk'],
  true, 3
) RETURNING id INTO act3;

INSERT INTO practice_rubrics (activity_id, name, description, max_score, sort_order) VALUES
  (act3, 'Data accuracy', 'Did the AI output correctly reference the numbers provided in the brief?', 25, 1),
  (act3, 'Insight quality', 'Did the user prompt for genuine insights, not just data restatements?', 25, 2),
  (act3, 'Constraint following', 'Did the user enforce the 150-word limit and required structure (insights, risk, action)?', 25, 3),
  (act3, 'Executive framing', 'Is the output suitable for a CEO audience — clear, opinionated, and jargon-free?', 25, 4);

END $$;
