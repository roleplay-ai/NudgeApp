-- Seed: 3 practice activities (rubrics defined inside assessment_prompt, no separate rubric rows)
-- Run this in the Supabase SQL editor

INSERT INTO practice_activities (
  name, description, category, difficulty,
  time_minutes, xp_reward, icon, color,
  assessment_prompt, hint_chips, is_published, order_index
) VALUES

-- ── Activity 1: Write a Job Description ─────────────────────────────────────
(
  'Write a Job Description',
  'Your startup is hiring a Senior Frontend Engineer. Use the AI to help you write a concise, compelling job description that covers: the role summary, 4–5 key responsibilities, required skills, and one nice-to-have. Keep it under 300 words and avoid corporate jargon.',
  'Text Generation',
  'Easy',
  10, 50, '📝', '#3B82F6',
  'You are an expert prompt engineering assessor. Evaluate how effectively the user prompted an AI to produce a high-quality job description. Score the user''s prompts as a combined body of work — focus on prompting quality, not just the AI output.

Rubric criteria:
1. Prompt Clarity (25 pts) — Did the user communicate the role and context clearly and unambiguously?
2. Specificity (25 pts) — Did the user specify constraints such as word count, tone, and required sections?
3. Task Completeness (25 pts) — Did the prompts lead to an output covering all required sections (summary, responsibilities, skills, nice-to-have)?
4. Efficiency (25 pts) — Did the user get a good result in few focused turns rather than many vague back-and-forths?

Be honest but constructive.',
  ARRAY['Describe the role in one sentence', 'List the required skills', 'Ask for it under 300 words'],
  true, 1
),

-- ── Activity 2: Angry Customer Reply ────────────────────────────────────────
(
  'Angry Customer Reply',
  'A customer left a furious review: "I ordered 2 weeks ago and still nothing. Your support team ignored me twice. I want a refund NOW." Use the AI to draft a professional, empathetic reply that acknowledges the frustration, apologises sincerely, offers a concrete resolution, and keeps the customer relationship intact. Tone: warm but professional.',
  'Prompt Engineering',
  'Medium',
  15, 70, '💬', '#F59E0B',
  'You are an expert prompt engineering assessor. Evaluate how effectively the user prompted an AI to produce a high-quality customer support reply. Score the user''s prompts as a combined body of work — focus on prompting strategy, not AI output quality alone.

Rubric criteria:
1. Empathy Instruction (25 pts) — Did the user prompt the AI to acknowledge the customer''s frustration genuinely?
2. Resolution Specificity (25 pts) — Did the user tell the AI what concrete resolution to offer (refund, replacement, timeline, etc.)?
3. Tone Control (25 pts) — Did the user guide the AI on tone — warm, professional, not defensive?
4. Completeness (25 pts) — Does the final reply cover apology, cause, resolution, and next steps?

Be honest but constructive.',
  ARRAY['Set the tone in your prompt', 'Specify the resolution to offer', 'Ask for empathy in the opening'],
  true, 2
),

-- ── Activity 3: Monthly Sales Insight ───────────────────────────────────────
(
  'Monthly Sales Insight',
  'You are a data analyst presenting to the CEO. Here is this month''s data: Revenue £124k (up 18% MoM), Top product: Pro Plan (62% of revenue), Churn rate: 4.2% (up from 3.1% last month), New customers: 87, Expansion revenue: £11k. Use the AI to produce a crisp executive summary — 3 key insights, one risk flag, and one recommended action. No more than 150 words.',
  'Data Analytics',
  'Hard',
  20, 90, '📊', '#8B5CF6',
  'You are an expert prompt engineering assessor. Evaluate how well the user prompted an AI to produce a clear, accurate executive data summary. Score the user''s prompts as a combined body of work.

Rubric criteria:
1. Data Accuracy (25 pts) — Did the user''s prompts lead the AI to correctly reference the numbers from the brief?
2. Insight Quality (25 pts) — Did the user prompt for genuine insights rather than just restatements of the raw data?
3. Constraint Following (25 pts) — Did the user enforce the 150-word limit and required structure (3 insights, 1 risk flag, 1 recommended action)?
4. Executive Framing (25 pts) — Is the output suitable for a CEO audience — clear, opinionated, and jargon-free?

Be honest but constructive.',
  ARRAY['Specify the word limit', 'Ask for exactly 3 insights', 'Tell it to flag the churn risk'],
  true, 3
);
