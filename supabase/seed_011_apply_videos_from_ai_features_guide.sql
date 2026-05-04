-- ============================================
-- Seed apply_videos from AI_Features_Guide.docx (Nudgeapp)
-- ============================================
-- Source: structured sections (title → tagline → body → platforms line).
-- video_url: placeholder sample MP4s (replace in Admin with your Supabase Storage or YouTube URLs).
-- is_published defaults to false so the same topics stay in "What can AI do?" (apply_tiles via seed_012)
--   without duplicating a full grid under Walkthroughs. Publish selected rows in Admin when you have real clips.
-- Safe re-run: deletes rows seeded by this script (matched by marker in description footer) then inserts.
-- ============================================

DELETE FROM public.apply_videos
WHERE description LIKE '%[seed:ai-features-guide-v1]%';

INSERT INTO public.apply_videos
  (title, description, video_url, thumbnail_url, duration, order_index, is_published, task_id)
VALUES
(
  'Canvas',
  $c1$Edit AI replies inline - surgically

Instead of asking AI to rewrite the whole response, Canvas opens it as a live document. Highlight one paragraph, give a new instruction, and only that part changes. Perfect for drafts, reports, and code where you want precision edits - not a full regeneration.

Platforms: ChatGPT | Claude | Gemini
[seed:ai-features-guide-v1]$c1$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  NULL,
  '~1 min',
  0,
  false,
  NULL
),
(
  'Notebook',
  $c2$AI answers grounded in your sources, not the internet

Upload your own documents, PDFs, or notes and the AI answers exclusively from that material - not from the web or its training data. Ideal for analysing a report, studying a policy document, or researching a topic using only trusted sources you provide.

Platforms: Gemini | Copilot
[seed:ai-features-guide-v1]$c2$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  NULL,
  '~1 min',
  1,
  false,
  NULL
),
(
  'Projects',
  $c3$One persistent workspace for ongoing work

Group related chats and files under a project. The AI remembers your context across every session - your role, your goal, your previous decisions. No re-explaining every time you open a new chat.

Platforms: Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c3$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  NULL,
  '~1 min',
  2,
  false,
  NULL
),
(
  'Connect apps',
  $c4$Let AI read your actual work data

Connect Gmail, Drive, Calendar, or other tools so the AI can pull real information from your actual accounts - not just answer from memory. Ask it to summarise today's emails, find a file, or check your schedule.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c4$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  NULL,
  '~1 min',
  3,
  false,
  NULL
),
(
  'Custom instructions',
  $c5$Stop repeating yourself in every chat

Set permanent rules once - your role, your preferred tone, what to avoid, how long answers should be - and the AI follows them automatically in every conversation without you having to re-explain.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c5$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  NULL,
  '~1 min',
  4,
  false,
  NULL
),
(
  'Memories',
  $c6$AI that learns who you are over time

The AI remembers facts about you across conversations - your job title, preferences, recurring context - and uses them to give sharper, more relevant answers without you repeating background every session.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c6$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  NULL,
  '~1 min',
  5,
  false,
  NULL
),
(
  'Temporary chats',
  $c7$Go incognito with AI

Nothing is saved, nothing is memorised, nothing is used for training. Temporary chats are for sensitive queries or one-off tasks you don't want stored anywhere.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c7$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  NULL,
  '~1 min',
  6,
  false,
  NULL
),
(
  'Thinking models',
  $c8$AI that reasons before it answers

Instead of responding instantly, the model works through the problem step by step before giving an answer. Better accuracy on complex analysis, multi-step logic, and tricky decisions where a quick answer would likely be wrong.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c8$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  NULL,
  '~1 min',
  7,
  false,
  NULL
),
(
  'Design images',
  $c9$Generate visuals from a text prompt

Describe what you want - a product mockup, a social media graphic, an illustration - and the AI creates it. No design tools, no designer needed.

Platforms: Gemini | Copilot | ChatGPT
[seed:ai-features-guide-v1]$c9$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  NULL,
  '~1 min',
  8,
  false,
  NULL
),
(
  'Deep research',
  $c10$AI that researches like an analyst, not a search engine

Give it a topic and it autonomously searches dozens of sources, reads them, cross-references findings, and delivers a structured report. What takes a human analyst hours takes minutes.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c10$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  NULL,
  '~1 min',
  9,
  false,
  NULL
),
(
  'Scheduled actions',
  $c11$AI that works even when you're not there

Set a task to run at a specific time or on a recurring schedule - daily briefings, weekly summaries, automated prompts. You define it once, AI executes it without you being in the chat.

Platforms: Gemini | Copilot | ChatGPT
[seed:ai-features-guide-v1]$c11$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  NULL,
  '~1 min',
  10,
  false,
  NULL
),
(
  'Design videos',
  $c12$Turn a text prompt into a short video

Describe a scene, concept, or message and the AI generates a short video clip. No camera, no editor, no production team needed.

Platforms: Gemini
[seed:ai-features-guide-v1]$c12$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  NULL,
  '~1 min',
  11,
  false,
  NULL
),
(
  'AI in Excel',
  $c13$Your data analyst, sitting inside your spreadsheet

AI works directly inside the file - writes formulas, cleans messy data, builds charts, and answers questions about your numbers in plain language. No switching between tools.

Platforms: Gemini | Copilot
[seed:ai-features-guide-v1]$c13$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  NULL,
  '~1 min',
  12,
  false,
  NULL
),
(
  'Gems (custom chatbots)',
  $c14$Build a bot so you never type the same prompt again

Instead of starting every chat with a long system prompt, build a saved AI assistant with a fixed role, tone, and instructions. Open it, type your question, get a consistent response - every time.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c14$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  NULL,
  '~1 min',
  13,
  false,
  NULL
),
(
  'Guided learning & quizzes',
  $c15$AI as your on-demand tutor

Ask the AI to teach you a topic, then quiz you on it. It explains, tests your understanding, and corrects mistakes in real time - structured learning without a course or a trainer.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c15$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  NULL,
  '~1 min',
  14,
  false,
  NULL
),
(
  'Design infographics',
  $c16$Turn data or concepts into shareable visuals

Describe what you want to communicate and the AI designs an infographic - comparisons, timelines, stats, frameworks - structured and visual, ready to drop into a deck or post.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c16$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  NULL,
  '~1 min',
  15,
  false,
  NULL
),
(
  'Design dashboards',
  $c17$Build a live data view without a developer

Describe your metrics and the AI assembles a dashboard with charts, KPIs, and tables. No coding, no BI tool license needed.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c17$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  NULL,
  '~1 min',
  16,
  false,
  NULL
),
(
  'AI browsers',
  $c18$A browser that takes actions, not just searches

AI-native browsers (Comet by Perplexity, Atlas by OpenAI) don't just retrieve information - they browse on your behalf, fill forms, complete multi-step tasks, and take real actions across websites. The next step beyond chatbots.

Platforms: Comet (Perplexity) | Operator/Atlas (OpenAI)
[seed:ai-features-guide-v1]$c18$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  NULL,
  '~1 min',
  17,
  false,
  NULL
),
(
  'Design slides (PPT)',
  $c19$From a topic to a full deck in minutes

Describe your subject and the AI builds a structured, designed presentation - slides, layout, content. Edit what you need or regenerate sections with a single prompt.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c19$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  NULL,
  '~1 min',
  18,
  false,
  NULL
),
(
  'Data analytics',
  $c20$Ask questions about your data in plain English

Upload a dataset and the AI analyses it - finds trends, flags anomalies, calculates metrics, and explains findings in plain language. No formulas, no SQL, no pivot tables.

Platforms: Gemini | Copilot | ChatGPT | Claude
[seed:ai-features-guide-v1]$c20$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  NULL,
  '~1 min',
  19,
  false,
  NULL
),
(
  'Create agents & automation',
  $c21$Build AI that completes multi-step tasks without you

Design agents that take autonomous actions - browse the web, send emails, update records, trigger workflows - end to end. You define the goal, the agent figures out the steps.

Platforms: Google AI Studio | Copilot Studio
[seed:ai-features-guide-v1]$c21$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  NULL,
  '~1 min',
  20,
  false,
  NULL
),
(
  'Vibe coding',
  $c22$Build working software by describing it in plain English

No IDE, no syntax, no prior coding knowledge needed. Describe what you want to build, and the AI writes, runs, tests, and refines the code through conversation. From idea to working app in hours.

Platforms: Codex (OpenAI) | Claude Code | Google AI Studio
[seed:ai-features-guide-v1]$c22$,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  NULL,
  '~1 min',
  21,
  false,
  NULL
);
