-- seed_quizzes_ai_genai.sql
-- Three AI & GenAI quizzes — 10 questions each, difficulty-ordered within each quiz.
-- Run after migration_034_quizzes.sql.
-- Idempotent: uses ON CONFLICT DO NOTHING throughout.

DO $$
DECLARE
  -- Quiz IDs
  quiz1 UUID := 'a1b2c3d4-0000-0000-0001-000000000001'; -- Foundations
  quiz2 UUID := 'a1b2c3d4-0000-0000-0002-000000000002'; -- Prompts & Features
  quiz3 UUID := 'a1b2c3d4-0000-0000-0003-000000000003'; -- AI in Action

  -- Question IDs — Quiz 1 (Q1–Q10)
  q01 UUID := 'b1000000-0001-0000-0000-000000000001';
  q02 UUID := 'b1000000-0001-0000-0000-000000000002';
  q03 UUID := 'b1000000-0001-0000-0000-000000000003';
  q04 UUID := 'b1000000-0001-0000-0000-000000000004';
  q05 UUID := 'b1000000-0001-0000-0000-000000000005';
  q06 UUID := 'b1000000-0001-0000-0000-000000000006';
  q07 UUID := 'b1000000-0001-0000-0000-000000000007';
  q08 UUID := 'b1000000-0001-0000-0000-000000000008';
  q09 UUID := 'b1000000-0001-0000-0000-000000000009';
  q10 UUID := 'b1000000-0001-0000-0000-000000000010';

  -- Question IDs — Quiz 2 (Q11–Q20)
  q11 UUID := 'b1000000-0002-0000-0000-000000000011';
  q12 UUID := 'b1000000-0002-0000-0000-000000000012';
  q13 UUID := 'b1000000-0002-0000-0000-000000000013';
  q14 UUID := 'b1000000-0002-0000-0000-000000000014';
  q15 UUID := 'b1000000-0002-0000-0000-000000000015';
  q16 UUID := 'b1000000-0002-0000-0000-000000000016';
  q17 UUID := 'b1000000-0002-0000-0000-000000000017';
  q18 UUID := 'b1000000-0002-0000-0000-000000000018';
  q19 UUID := 'b1000000-0002-0000-0000-000000000019';
  q20 UUID := 'b1000000-0002-0000-0000-000000000020';

  -- Question IDs — Quiz 3 (Q21–Q30)
  q21 UUID := 'b1000000-0003-0000-0000-000000000021';
  q22 UUID := 'b1000000-0003-0000-0000-000000000022';
  q23 UUID := 'b1000000-0003-0000-0000-000000000023';
  q24 UUID := 'b1000000-0003-0000-0000-000000000024';
  q25 UUID := 'b1000000-0003-0000-0000-000000000025';
  q26 UUID := 'b1000000-0003-0000-0000-000000000026';
  q27 UUID := 'b1000000-0003-0000-0000-000000000027';
  q28 UUID := 'b1000000-0003-0000-0000-000000000028';
  q29 UUID := 'b1000000-0003-0000-0000-000000000029';
  q30 UUID := 'b1000000-0003-0000-0000-000000000030';

BEGIN

-- ── Quizzes ──────────────────────────────────────────────────────────────────

INSERT INTO quizzes
  (id, title, description, emoji, color, order_index, is_published, is_locked, points_per_question, completion_bonus, time_per_question)
VALUES
  (quiz1,
   'GenAI Foundations',
   'What is Generative AI, how does it work, and why does it hallucinate? Start here.',
   '🧠', '#623CEA', 1, true, false, 10, 25, 30),

  (quiz2,
   'Prompts & AI Features',
   'Craft better prompts and learn which AI feature to reach for in any situation.',
   '✍️', '#3699FC', 2, true, false, 10, 25, 20),

  (quiz3,
   'AI in Action',
   'Agents, workflows, data tasks, and real-world scenarios. Put it all together.',
   '🚀', '#23CE6B', 3, true, false, 10, 25, 15)

ON CONFLICT (id) DO NOTHING;

-- ── Quiz 1 Questions: GenAI Foundations (Q1–Q10) ─────────────────────────────

INSERT INTO quiz_questions
  (id, quiz_id, question, feedback_correct, feedback_incorrect, order_index)
VALUES
  (q01, quiz1, 'What does Generative AI mainly do?',
   'Correct! GenAI creates new content — text, images, code, and more.',
   'Not quite. GenAI''s defining ability is generating new content, not storing files or automating fixed tasks.', 0),

  (q02, quiz1, 'Which statement best describes the relationship between AI and GenAI?',
   'Correct! GenAI is a subset of AI — a type of AI focused on generating new content.',
   'Not quite. GenAI is a type of AI, not the other way around.', 1),

  (q03, quiz1, 'Which example best represents Generative AI?',
   'Correct! Creating a training email is a generative task — producing new written content.',
   'Not quite. GenAI is defined by creating new content, like drafting an email.', 2),

  (q04, quiz1, 'What does GPT stand for?',
   'Correct! GPT = Generative Pre-trained Transformer.',
   'Not quite. GPT stands for Generative Pre-trained Transformer.', 3),

  (q05, quiz1, 'What does "pre-trained" mean?',
   'Correct! Pre-trained means the model learned from large datasets before you ever used it.',
   'Not quite. Pre-trained means the model was trained on large data before public release.', 4),

  (q06, quiz1, 'What are tokens in GenAI?',
   'Correct! Tokens are the basic units of input and output — roughly a word or part of a word.',
   'Not quite. Tokens are units of AI input/output, not credits or memory slots.', 5),

  (q07, quiz1, 'What is a prompt?',
   'Correct! A prompt is the instruction or question you give to an AI.',
   'Not quite. A prompt is the user instruction sent to the AI.', 6),

  (q08, quiz1, 'What is hallucination in AI?',
   'Correct! Hallucination is when AI confidently states something that is factually wrong.',
   'Not quite. Hallucination means the AI produces a confident but incorrect answer.', 7),

  (q09, quiz1, 'Why can GenAI sometimes hallucinate?',
   'Correct! GenAI predicts the most likely next word — it doesn''t look up facts.',
   'Not quite. GenAI hallucinates because it predicts likely text, not verified facts.', 8),

  (q10, quiz1, 'What is a context window?',
   'Correct! The context window is the chatbot''s active working memory for a conversation.',
   'Not quite. The context window is the model''s working memory — the text it can "see" at once.', 9)

ON CONFLICT (id) DO NOTHING;

-- ── Quiz 2 Questions: Prompts & AI Features (Q11–Q20) ────────────────────────

INSERT INTO quiz_questions
  (id, quiz_id, question, feedback_correct, feedback_incorrect, order_index)
VALUES
  (q11, quiz2, 'Why can long chats with AI become unreliable?',
   'Correct! When a conversation grows long, the context window fills up and earlier content is lost.',
   'Not quite. Long chats become unreliable because the context window gets crowded.', 0),

  (q12, quiz2, 'What helps AI track context across a conversation?',
   'Correct! The transformer architecture is what allows AI to track relationships across long text.',
   'Not quite. The transformer design is the mechanism that helps AI maintain context.', 1),

  (q13, quiz2, 'Which prompt element gives background information?',
   'Correct! Context is the element that provides background — who, where, why.',
   'Not quite. The context element provides the background information in a prompt.', 2),

  (q14, quiz2, 'Which element is missing from this prompt: "Create a 5-slide PPT on AI adoption"?',
   'Correct! The prompt lacks context (why, for whom) and audience information.',
   'Not quite. The prompt has a task and output, but is missing context and audience.', 3),

  (q15, quiz2, 'What does RAG help AI do?',
   'Correct! RAG (Retrieval-Augmented Generation) lets AI retrieve relevant source information before answering.',
   'Not quite. RAG helps AI retrieve relevant source information to ground its answers.', 4),

  (q16, quiz2, 'What is Notebook best suited for?',
   'Correct! Notebook is built for asking questions grounded in uploaded sources.',
   'Not quite. Notebook is best for asking questions from documents you''ve uploaded.', 5),

  (q17, quiz2, 'What is a Custom Chatbot or Gem best suited for?',
   'Correct! Custom chatbots follow reusable instructions you define — like a preset persona or workflow.',
   'Not quite. Custom chatbots are best for following reusable instructions, not one-off searches.', 6),

  (q18, quiz2, 'When should you use temporary chat?',
   'Correct! Temporary chat is for queries you don''t want the AI to remember later.',
   'Not quite. Use temporary chat when you don''t want the AI to retain anything from the conversation.', 7),

  (q19, quiz2, 'You want to organise several chats, files, and outputs for one workstream. Which feature fits?',
   'Correct! Projects let you group related chats, files, and outputs in one place.',
   'Not quite. Projects are the right tool for organising multiple related chats and files.', 8),

  (q20, quiz2, 'You want to keep editing a response side-by-side instead of only chatting. Which feature helps?',
   'Correct! Canvas gives you a side-by-side editing view alongside the chat.',
   'Not quite. Canvas is the feature that lets you edit AI outputs alongside the conversation.', 9)

ON CONFLICT (id) DO NOTHING;

-- ── Quiz 3 Questions: AI in Action (Q21–Q30) ─────────────────────────────────

INSERT INTO quiz_questions
  (id, quiz_id, question, feedback_correct, feedback_incorrect, order_index)
VALUES
  (q21, quiz3, 'You want AI to access your emails, calendar, or work files. Which feature is relevant?',
   'Correct! Connect apps is the feature that lets AI read from your email, calendar, or files.',
   'Not quite. Connect apps enables AI to integrate with your email, calendar, and work files.', 0),

  (q22, quiz3, 'What is tool calling?',
   'Correct! Tool calling means the AI uses external applications or APIs to complete a task.',
   'Not quite. Tool calling is when AI invokes external applications or tools.', 1),

  (q23, quiz3, 'What makes an AI agent different from a chatbot?',
   'Correct! An AI agent takes goal-based actions — it can plan steps and act, not just respond.',
   'Not quite. AI agents are defined by taking goal-based actions autonomously.', 2),

  (q24, quiz3, 'What is a trigger in an AI agent workflow?',
   'Correct! A trigger is the event that starts an agent workflow — like receiving an email.',
   'Not quite. A trigger is the event that kicks off the agent''s workflow.', 3),

  (q25, quiz3, 'Every morning, you want AI to check meetings and unread emails. Which feature fits?',
   'Correct! Scheduled actions let AI run tasks automatically at set times.',
   'Not quite. Scheduled actions are what allow AI to perform recurring tasks automatically.', 4),

  (q26, quiz3, 'What should AI check first in spreadsheets?',
   'Correct! Before any analysis, AI should inspect the column structure and data quality.',
   'Not quite. Data quality and column structure should always be checked before analysis.', 5),

  (q27, quiz3, 'You uploaded a messy employee dataset. What should AI do before analysis?',
   'Correct! Inspecting data quality first prevents errors in any downstream analysis.',
   'Not quite. AI should always inspect data quality before running analysis.', 6),

  (q28, quiz3, 'You want AI to answer only from an uploaded company policy. Which tool is best?',
   'Correct! Notebook ensures AI answers come only from the sources you uploaded.',
   'Not quite. Notebook is designed to answer questions grounded only in uploaded documents.', 7),

  (q29, quiz3, 'You are asking something sensitive and do not want it remembered. Which feature should you use?',
   'Correct! Temporary chat ensures the conversation is not saved or used for future memory.',
   'Not quite. Temporary chat is the right choice when you don''t want the AI to remember anything.', 8),

  (q30, quiz3, 'You want to prototype a refund chatbot app without coding from scratch. Which use case fits?',
   'Correct! Vibe coding lets you build apps through natural language with AI assistance.',
   'Not quite. Vibe coding is the use case for building apps with AI, no prior code needed.', 9)

ON CONFLICT (id) DO NOTHING;

-- ── Options ──────────────────────────────────────────────────────────────────
-- order_index: 0=A  1=B  2=C  3=D

INSERT INTO quiz_options (question_id, option_text, is_correct, order_index)
VALUES
  -- ── Quiz 1 options ──────────────────────────────────────────────────────

  -- Q1  correct A
  (q01, 'Creates new content',    true,  0),
  (q01, 'Stores company files',   false, 1),
  (q01, 'Searches live websites', false, 2),
  (q01, 'Automates fixed tasks',  false, 3),

  -- Q2  correct B
  (q02, 'GenAI and AI are exactly the same', false, 0),
  (q02, 'GenAI is a type of AI',             true,  1),
  (q02, 'AI is a type of GenAI',             false, 2),
  (q02, 'GenAI only works with images',      false, 3),

  -- Q3  correct A
  (q03, 'Creating a training email',  true,  0),
  (q03, 'Blocking a spam call',       false, 1),
  (q03, 'Tracking delivery location', false, 2),
  (q03, 'Unlocking a phone screen',   false, 3),

  -- Q4  correct B
  (q04, 'General Prompt Technology',          false, 0),
  (q04, 'Generative Pre-trained Transformer', true,  1),
  (q04, 'Google Processing Tool',             false, 2),
  (q04, 'Guided Prompt Training',             false, 3),

  -- Q5  correct B
  (q05, 'Trained by each user',       false, 0),
  (q05, 'Learned before public use',  true,  1),
  (q05, 'Updated after every prompt', false, 2),
  (q05, 'Installed inside Excel',     false, 3),

  -- Q6  correct A
  (q06, 'A unit of AI input',     true,  0),
  (q06, 'A saved AI memory',      false, 1),
  (q06, 'A chatbot login credit', false, 2),
  (q06, 'A file upload limit',    false, 3),

  -- Q7  correct A
  (q07, 'User instruction', true,  0),
  (q07, 'Chatbot memory',   false, 1),
  (q07, 'Paid account',     false, 2),
  (q07, 'System update',    false, 3),

  -- Q8  correct A
  (q08, 'A confident wrong answer', true,  0),
  (q08, 'A slow AI response',       false, 1),
  (q08, 'A deleted chat history',   false, 2),
  (q08, 'A blocked file upload',    false, 3),

  -- Q9  correct A
  (q09, 'It predicts likely answers', true,  0),
  (q09, 'It ignores every prompt',    false, 1),
  (q09, 'It cannot write text',       false, 2),
  (q09, 'It only reads images',       false, 3),

  -- Q10  correct A
  (q10, 'The chatbot''s working memory', true,  0),
  (q10, 'The screen display size',       false, 1),
  (q10, 'The user''s login time',        false, 2),
  (q10, 'The number of open apps',       false, 3),

  -- ── Quiz 2 options ──────────────────────────────────────────────────────

  -- Q11  correct C
  (q11, 'The browser becomes slow',         false, 0),
  (q11, 'The model changes automatically',  false, 1),
  (q11, 'Context space gets crowded',       true,  2),
  (q11, 'Prompts become permanently saved', false, 3),

  -- Q12  correct A
  (q12, 'Transformer design', true,  0),
  (q12, 'File compression',   false, 1),
  (q12, 'Screen resolution',  false, 2),
  (q12, 'Email filtering',    false, 3),

  -- Q13  correct D
  (q13, 'Format',  false, 0),
  (q13, 'Persona', false, 1),
  (q13, 'Task',    false, 2),
  (q13, 'Context', true,  3),

  -- Q14  correct B
  (q14, 'Task',                 false, 0),
  (q14, 'Context and audience', true,  1),
  (q14, 'Action verb',          false, 2),
  (q14, 'Output request',       false, 3),

  -- Q15  correct B
  (q15, 'Design better images',                false, 0),
  (q15, 'Retrieve relevant source information', true,  1),
  (q15, 'Reduce typing effort',                false, 2),
  (q15, 'Improve screen layout',               false, 3),

  -- Q16  correct A
  (q16, 'Asking questions from uploaded sources', true,  0),
  (q16, 'Creating reusable prompt instructions',  false, 1),
  (q16, 'Chatting with general AI knowledge',     false, 2),
  (q16, 'Automating multi-step workflows',        false, 3),

  -- Q17  correct D
  (q17, 'Using fixed uploaded sources',    false, 0),
  (q17, 'Searching only live websites',    false, 1),
  (q17, 'Running scheduled workflows',     false, 2),
  (q17, 'Following reusable instructions', true,  3),

  -- Q18  correct A
  (q18, 'For queries not remembered later',   true,  0),
  (q18, 'For building long-term preferences', false, 1),
  (q18, 'For saving reusable instructions',   false, 2),
  (q18, 'For training a custom chatbot',      false, 3),

  -- Q19  correct A
  (q19, 'Projects',       true,  0),
  (q19, 'Temporary chat', false, 1),
  (q19, 'SynthID',        false, 2),
  (q19, 'Token',          false, 3),

  -- Q20  correct A
  (q20, 'Canvas',        true,  0),
  (q20, 'Notebook',      false, 1),
  (q20, 'SynthID',       false, 2),
  (q20, 'Agent trigger', false, 3),

  -- ── Quiz 3 options ──────────────────────────────────────────────────────

  -- Q21  correct D
  (q21, 'Import memories',   false, 0),
  (q21, 'Picture framework', false, 1),
  (q21, 'Guided learning',   false, 2),
  (q21, 'Connect apps',      true,  3),

  -- Q22  correct A
  (q22, 'Using external applications', true,  0),
  (q22, 'Writing longer prompts',      false, 1),
  (q22, 'Saving user memories',        false, 2),
  (q22, 'Changing chatbot tone',       false, 3),

  -- Q23  correct D
  (q23, 'It gives shorter answers',           false, 0),
  (q23, 'It only searches documents',         false, 1),
  (q23, 'It remembers every user preference', false, 2),
  (q23, 'It takes goal-based actions',        true,  3),

  -- Q24  correct D
  (q24, 'The rule that prices it',   false, 0),
  (q24, 'The memory that stores it', false, 1),
  (q24, 'The source that trains it', false, 2),
  (q24, 'The event that starts it',  true,  3),

  -- Q25  correct B
  (q25, 'Deep research',     false, 0),
  (q25, 'Scheduled actions', true,  1),
  (q25, 'Image generation',  false, 2),
  (q25, 'Notebook sources',  false, 3),

  -- Q26  correct C
  (q26, 'Charts and colors',         false, 0),
  (q26, 'Passwords and permissions', false, 1),
  (q26, 'Columns and data quality',  true,  2),
  (q26, 'Fonts and formatting',      false, 3),

  -- Q27  correct A
  (q27, 'Inspect data quality',  true,  0),
  (q27, 'Delete unusual values', false, 1),
  (q27, 'Create final charts',   false, 2),
  (q27, 'Write speaker notes',   false, 3),

  -- Q28  correct A
  (q28, 'Notebook',        true,  0),
  (q28, 'Skills',          false, 1),
  (q28, 'Temporary chat',  false, 2),
  (q28, 'General chatbot', false, 3),

  -- Q29  correct D  (Option D replaced with "Temporary chat" per source file note)
  (q29, 'Memory',         false, 0),
  (q29, 'Notebook',       false, 1),
  (q29, 'Dashboard',      false, 2),
  (q29, 'Temporary chat', true,  3),

  -- Q30  correct A
  (q30, 'Vibe coding',   true,  0),
  (q30, 'Deep research', false, 1),
  (q30, 'Memory import', false, 2),
  (q30, 'AI detection',  false, 3)

ON CONFLICT (id) DO NOTHING;

END $$;
