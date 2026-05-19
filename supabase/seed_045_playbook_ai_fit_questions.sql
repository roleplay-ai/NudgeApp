-- ============================================================
-- AI Fit Test — scenario seed (15 questions)
-- Run after migration_045_playbook_cab_fit_schema.sql
-- ============================================================

-- Clear existing rows so this is safe to re-run
TRUNCATE public.ai_fit_questions RESTART IDENTITY CASCADE;

INSERT INTO public.ai_fit_questions
  (scenario, choice_use_label, choice_partial_label, choice_avoid_label, correct_answer, rationale, sort_order, is_active)
VALUES

-- ── USE AI ───────────────────────────────────────────────────────────────────

(
  'You need to summarize a 40-page industry report into a one-page brief for your leadership team.',
  'Use AI to summarize it', 'Use AI for a first draft, then edit', 'Write it by hand',
  'use',
  'Summarization is one of the strongest AI use cases. A 40-page document becomes a one-page brief in seconds. Review the output for accuracy, but the speed gain is massive and the risk is low.',
  10, true
),
(
  'You want to create a first draft of a job description for a new role on your team.',
  'Use AI to write the draft', 'Use AI for structure, then fill in the details', 'Write it from scratch',
  'use',
  'Job descriptions follow a predictable structure. AI drafts one quickly, you refine the role-specific requirements. This is a high-value, low-risk use of AI that saves 30–60 minutes.',
  20, true
),
(
  'You need to translate a product manual from English into French for a new market.',
  'Use AI to translate it', 'Use AI, then have a native speaker review key sections', 'Hire a human translator for the whole document',
  'use',
  'AI translation quality is strong enough for most business documents. For a product manual, AI translation is fast and cost-effective. A native speaker spot-check is a good extra step but AI alone is often sufficient.',
  30, true
),
(
  'You want to brainstorm 20 creative concepts for a new marketing campaign.',
  'Use AI to generate ideas', 'Use AI for a starting list, then add your own', 'Brainstorm with the team only',
  'use',
  'Generating a large volume of creative starting points is one of the clearest wins for AI. You will still filter and select the best ideas, but AI can produce 20 concepts in seconds that would take a team 30+ minutes to reach.',
  40, true
),
(
  'You need to build a competitor analysis — features, pricing, and positioning — across five rival products.',
  'Use AI to research and structure it', 'Use AI for the structure, verify facts manually', 'Do the research manually',
  'use',
  'AI can rapidly pull together publicly available information and structure a comparison. Spot-check key facts (pricing especially changes frequently), but the research and synthesis effort is cut from hours to minutes.',
  50, true
),

-- ── USE PARTIALLY ────────────────────────────────────────────────────────────

(
  'A customer has sent an angry email about a billing error that has caused them real financial stress.',
  'Let AI write and send the reply', 'Use AI to draft the reply, then edit and send it yourself', 'Write the reply entirely yourself',
  'partial',
  'AI can draft a professional, empathetic response quickly — but you must review it before sending. Billing disputes involve account-specific facts and emotional nuance. The final message should sound like a human who actually cares, not a template.',
  60, true
),
(
  'You are preparing talking points for a pitch to a major investor next week.',
  'Have AI write the full pitch deck and talking points', 'Use AI to structure and draft, then make it genuinely your own', 'Write everything yourself',
  'partial',
  'AI is excellent at structuring a narrative and drafting an initial version. But investors invest in people — your conviction, your story, your specific insight. The final talking points must reflect your voice and your honest take on the business.',
  70, true
),
(
  'You need to write a performance review for a team member who has had a difficult year with mixed results.',
  'Have AI write the review based on your notes', 'Use AI to structure your notes, then write the assessment yourself', 'Write the full review without AI',
  'partial',
  'AI can turn bullet-point notes into a structured, professional draft. But performance reviews require your genuine judgment, specific examples, and fair assessment. Never let AI write the actual evaluation — use it to organize your thinking, not to replace it.',
  80, true
),
(
  'You are debugging code that is causing a production outage affecting live customers.',
  'Ask AI to diagnose and fix the issue', 'Use AI to surface possible causes and suggest fixes, then verify before deploying', 'Debug without AI assistance',
  'partial',
  'AI can suggest likely causes fast, which is valuable in a high-pressure incident. But you must read, understand, and test every change before deploying to production. AI suggestions are starting points — an unreviewed fix could make the outage worse.',
  90, true
),
(
  'You need to send a newsletter to 15,000 customers announcing a product update.',
  'Let AI write and send it', 'Use AI to draft, then review, approve, and send yourself', 'Write the newsletter without AI',
  'partial',
  'AI can produce a solid first draft of a newsletter quickly. But a message to 15,000 customers represents your brand — review tone, check factual accuracy, and make sure it sounds like you before it goes out. One-click send should always be a human decision.',
  100, true
),

-- ── AVOID AI ─────────────────────────────────────────────────────────────────

(
  'You are deciding which of two equally qualified candidates to hire for a senior leadership role.',
  'Use AI to make or recommend the hiring decision', 'Use AI to compare their CVs and interview notes', 'Make the decision yourself',
  'avoid',
  'Hiring decisions involve subjective judgment, cultural fit, leadership potential, and legal accountability. AI has no way to assess these reliably — and delegating this to AI introduces bias risk and removes human responsibility from a decision that affects someone''s career.',
  110, true
),
(
  'Your company is filing a compliance report with a financial regulator.',
  'Use AI to write the report and file it', 'Use AI to draft sections, have a compliance officer review and sign off', 'Have your compliance team prepare and file it',
  'avoid',
  'Regulatory filings carry legal liability. Errors can result in fines, audits, or loss of operating licenses. This work must be owned, reviewed, and approved by qualified professionals who understand the specific regulatory requirements and can be held accountable.',
  120, true
),
(
  'You need to decide which 10 employees will be made redundant in a restructure.',
  'Use AI to identify who should be let go based on performance data', 'Use AI to analyze performance data as one input into the decision', 'Make the decisions through a proper HR and leadership process',
  'avoid',
  'Redundancy decisions affect people''s livelihoods and carry significant legal exposure. They require transparent criteria, human judgment, legal review, and proper process. Using AI to select who loses their job — even partially — creates ethical and legal risk the organization cannot afford.',
  130, true
),
(
  'A team member comes to you to talk about a personal situation that is affecting their work.',
  'Use AI to suggest how to respond to them', 'Use AI to prepare for the conversation in advance', 'Have the conversation without AI involvement',
  'avoid',
  'This is a human moment that requires empathy, presence, and trust — not an algorithm. Preparing a conversation by running the situation through an AI tool risks making your response feel rehearsed or detached. Show up as a person, not a script.',
  140, true
),
(
  'Your security team has detected unusual access patterns that may indicate a data breach.',
  'Ask AI to investigate the logs and confirm if it was a breach', 'Use AI to help analyze log patterns, but have your security team lead the investigation', 'Have your security team investigate without AI',
  'avoid',
  'A potential security breach requires qualified incident responders who understand your specific systems, threat landscape, and legal obligations. AI can assist with log parsing, but handing the investigation to AI introduces risk of missed indicators and creates accountability gaps that matter when regulators or insurers ask questions later.',
  150, true
);
