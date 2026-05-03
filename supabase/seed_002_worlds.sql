-- ============================================
-- Seed: Worlds, modules, sample card screens
-- Run AFTER migration_002_worlds.sql
-- ============================================

-- 7 Worlds
insert into public.worlds (id, title, description, emoji, order_index) values
('w1111111-1111-1111-1111-111111111111', 'What is AI?', 'The basics — what AI is, what it isn''t.', '🌱', 1),
('w2222222-2222-2222-2222-222222222222', 'How GenAI reads language', 'How AI turns your words into something it understands.', '🔤', 2),
('w3333333-3333-3333-3333-333333333333', 'How GenAI generates answers', 'Where AI''s answers come from — and when they go wrong.', '✨', 3),
('w4444444-4444-4444-4444-444444444444', 'Get better answers', 'The art of prompting.', '🎯', 4),
('w5555555-5555-5555-5555-555555555555', 'What AI remembers (and forgets)', 'Memory, context, and why prompts cost money.', '🧠', 5),
('w6666666-6666-6666-6666-666666666666', 'Give AI your own knowledge', 'RAG and grounding AI in your data.', '📚', 6),
('w7777777-7777-7777-7777-777777777777', 'When AI does things for you', 'Tools, agents, and automation.', '🤖', 7);

-- 22 Modules
insert into public.modules (id, world_id, title, description, concepts, order_index, next_module_hint) values
-- World 1
('m1111111-0001-0000-0000-000000000000', 'w1111111-1111-1111-1111-111111111111', 'AI vs ML vs Deep Learning', 'Three terms, three layers. Untangle them.', '{"AI","ML","Deep Learning"}', 1, 'GenAI, LLMs, multimodal'),
('m1111111-0002-0000-0000-000000000000', 'w1111111-1111-1111-1111-111111111111', 'GenAI, LLMs, multimodal', 'What today''s AI can produce.', '{"GenAI","LLM","Multimodal"}', 2, 'What AI can''t do'),
('m1111111-0003-0000-0000-000000000000', 'w1111111-1111-1111-1111-111111111111', 'What AI can''t do', 'Limitations and built-in bias.', '{"Limitations","Bias"}', 3, 'How AI breaks down your words'),

-- World 2
('m2222222-0001-0000-0000-000000000000', 'w2222222-2222-2222-2222-222222222222', 'How AI breaks down your words', 'Tokens & tokenization.', '{"Tokens","Tokenization"}', 1, 'How AI finds meaning'),
('m2222222-0002-0000-0000-000000000000', 'w2222222-2222-2222-2222-222222222222', 'How AI finds meaning', 'Embeddings & semantic search.', '{"Embeddings","Semantic Search"}', 2, 'Where AI''s knowledge comes from'),

-- World 3
('m3333333-0001-0000-0000-000000000000', 'w3333333-3333-3333-3333-333333333333', 'Where AI''s knowledge comes from', 'Training data & parameters.', '{"Training Data","Parameters"}', 1, 'How AI predicts the next word'),
('m3333333-0002-0000-0000-000000000000', 'w3333333-3333-3333-3333-333333333333', 'How AI predicts the next word', 'Next-token prediction & temperature.', '{"Next-token Prediction","Temperature"}', 2, 'When AI makes things up'),
('m3333333-0003-0000-0000-000000000000', 'w3333333-3333-3333-3333-333333333333', 'When AI makes things up', 'Hallucinations + chat vs reasoning models.', '{"Hallucinations","Reasoning Models"}', 3, 'Writing clearer prompts'),

-- World 4
('m4444444-0001-0000-0000-000000000000', 'w4444444-4444-4444-4444-444444444444', 'Writing clearer prompts', 'Clarity and specificity wins.', '{"Prompt Clarity","Specificity"}', 1, 'Giving AI a role'),
('m4444444-0002-0000-0000-000000000000', 'w4444444-4444-4444-4444-444444444444', 'Giving AI a role', 'Role prompting.', '{"Role Prompting"}', 2, 'Showing examples & system prompts'),
('m4444444-0003-0000-0000-000000000000', 'w4444444-4444-4444-4444-444444444444', 'Showing examples & system prompts', 'Few-shot prompting & system prompts.', '{"Few-shot","System Prompts"}', 3, 'The context window'),

-- World 5
('m5555555-0001-0000-0000-000000000000', 'w5555555-5555-5555-5555-555555555555', 'The context window', 'Input & output tokens.', '{"Context Window","Input/Output Tokens"}', 1, 'Conversation history & memory'),
('m5555555-0002-0000-0000-000000000000', 'w5555555-5555-5555-5555-555555555555', 'Conversation history & memory', 'Short vs long-term memory.', '{"Short-term Memory","Long-term Memory"}', 2, 'Why prompts cost money'),
('m5555555-0003-0000-0000-000000000000', 'w5555555-5555-5555-5555-555555555555', 'Why prompts cost money', 'Cost & latency.', '{"Cost","Latency"}', 3, 'Context engineering basics'),
('m5555555-0004-0000-0000-000000000000', 'w5555555-5555-5555-5555-555555555555', 'Context engineering basics', 'Set the stage for better answers.', '{"Context Engineering"}', 4, 'What is RAG?'),

-- World 6
('m6666666-0001-0000-0000-000000000000', 'w6666666-6666-6666-6666-666666666666', 'What is RAG?', 'Retrieval-Augmented Generation & knowledge base.', '{"RAG","Knowledge Base"}', 1, 'Chunking & retrieval'),
('m6666666-0002-0000-0000-000000000000', 'w6666666-6666-6666-6666-666666666666', 'Chunking & retrieval', 'How AI looks up your docs.', '{"Chunking","Retrieval"}', 2, 'Grounding & citations'),
('m6666666-0003-0000-0000-000000000000', 'w6666666-6666-6666-6666-666666666666', 'Grounding & citations', 'Trustworthy answers with sources.', '{"Grounding","Citations"}', 3, 'Tool calling & APIs'),

-- World 7
('m7777777-0001-0000-0000-000000000000', 'w7777777-7777-7777-7777-777777777777', 'Tool calling & APIs', 'When AI uses other tools.', '{"Tool Calling","APIs"}', 1, 'Connectors & workflow automation'),
('m7777777-0002-0000-0000-000000000000', 'w7777777-7777-7777-7777-777777777777', 'Connectors & workflow automation', 'Plug AI into your stack.', '{"Connectors","Automation"}', 2, 'AI agents'),
('m7777777-0003-0000-0000-000000000000', 'w7777777-7777-7777-7777-777777777777', 'AI agents', 'AI that takes actions on its own.', '{"Agents"}', 3, 'Guardrails, privacy, evaluation'),
('m7777777-0004-0000-0000-000000000000', 'w7777777-7777-7777-7777-777777777777', 'Guardrails, privacy, evaluation', 'Safety, trust, measurement.', '{"Guardrails","Privacy","Evaluation"}', 4, null);

-- Sample card screens for Module 2.1: How AI breaks down your words
insert into public.module_screens (module_id, screen_type, label, title, body, examples, caption, question, options, correct_index, feedback, next_text, order_index) values
('m2222222-0001-0000-0000-000000000000', 'hook', 'HOOK',
  'Ever wonder how AI actually "reads" what you type?',
  'It doesn''t see words the way you do.',
  null, null, null, null, null, null, null, 0),

('m2222222-0001-0000-0000-000000000000', 'idea', 'THE IDEA',
  'AI breaks your sentence into chunks called tokens.',
  'A token can be a whole word, part of a word, or punctuation. The process is called tokenization.',
  null, null, null, null, null, null, null, 1),

('m2222222-0001-0000-0000-000000000000', 'example', 'SEE IT',
  'Tokens in action',
  null,
  '[
    {"tone":"neutral","label":"Whole words","text":"\"I love pizza\"","tokens":["I","love","pizza"]},
    {"tone":"neutral","label":"Word pieces","text":"\"Unbelievable\"","tokens":["Un","believ","able"]}
  ]'::jsonb,
  'Notice: long or unusual words get split into pieces.',
  null, null, null, null, null, 2),

('m2222222-0001-0000-0000-000000000000', 'why', 'WHY IT MATTERS',
  'Why this should matter to you',
  'AI charges by tokens. More tokens = higher cost + slower replies. Short, clear prompts win.',
  null, null, null, null, null, null, null, 3),

('m2222222-0001-0000-0000-000000000000', 'check', 'QUICK CHECK',
  null, null, null, null,
  'Roughly how many tokens is "AI is amazing"?',
  '["1","3","10"]'::jsonb, 1,
  'Each short word ≈ 1 token. So 3 words ≈ 3 tokens.',
  null, 4),

('m2222222-0001-0000-0000-000000000000', 'unlocked', null,
  'Module complete', 'You now understand', null, null, null, null, null, null,
  'How AI finds meaning', 5);

-- Sample card screens for Module 4.2: Giving AI a role
insert into public.module_screens (module_id, screen_type, label, title, body, examples, caption, question, options, correct_index, feedback, next_text, order_index) values
('m4444444-0002-0000-0000-000000000000', 'hook', 'HOOK',
  'Same question. Different answers.',
  'The trick? Tell AI who to be.',
  null, null, null, null, null, null, null, 0),

('m4444444-0002-0000-0000-000000000000', 'idea', 'THE IDEA',
  'Role prompting',
  'Tell AI to act as a specific persona. Example: "You are a strict editor." It shifts tone, depth, and focus instantly.',
  null, null, null, null, null, null, null, 1),

('m4444444-0002-0000-0000-000000000000', 'example', 'SEE THE DIFFERENCE',
  'Same task. Sharper answer.',
  null,
  '[
    {"tone":"bad","label":"Without a role","text":"Review my email."},
    {"tone":"good","label":"With a role","text":"You are a no-nonsense executive coach. Review my email for clarity and confidence."}
  ]'::jsonb,
  null, null, null, null, null, null, 2),

('m4444444-0002-0000-0000-000000000000', 'why', 'WHY IT MATTERS',
  'Roles give AI a lens',
  'Without one: generic answers. With one: focused, useful answers.',
  null, null, null, null, null, null, null, 3),

('m4444444-0002-0000-0000-000000000000', 'check', 'QUICK CHECK',
  null, null, null, null,
  'Which prompt will likely give a sharper answer?',
  '["Tell me about leadership","You are a Harvard executive coach. Give me 3 leadership traits that fail in remote teams."]'::jsonb, 1,
  'Specific role + specific task = focused, useful answer.',
  null, 4),

('m4444444-0002-0000-0000-000000000000', 'unlocked', null,
  'Module complete', 'You now understand', null, null, null, null, null, null,
  'Showing examples & system prompts', 5);
