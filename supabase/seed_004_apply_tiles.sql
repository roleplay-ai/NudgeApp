-- Run AFTER migration_004_apply_tiles.sql
-- Seeds 25 Apply tiles and 1 active trending entry.
-- Slides are intentionally NOT pre-populated — admin uploads images & captions.

-- Trending hero (table: trending_topics — see migration_004)
insert into public.trending_topics (emoji, title, subtitle, body, why_matters, is_active) values
(
  '🤖',
  'Agents go mainstream',
  'From advisor to doer — the shift defining 2026',
  'Companies are deploying task-completing AI agents in HR, sales, and ops at scale. The boundary between "AI helps me" and "AI does it for me" is collapsing fast.',
  'If your team isn''t piloting at least one agent, you''re already 6 months behind.',
  true
);

-- 25 Apply tiles
insert into public.apply_tiles (title, subtitle, group_name, is_featured, order_index) values
-- Features (9)
('CANVAS', 'Edit AI replies inline', 'Features', false, 1),
('GEMS', 'Build your own AI assistant', 'Features', false, 2),
('NOTEBOOK LM', 'Make a podcast from your docs', 'Features', false, 3),
('DEEP RESEARCH', 'AI does hours of research for you', 'Features', false, 4),
('MEMORY', 'Make AI remember you', 'Features', false, 5),
('SCHEDULED ACTIONS', 'AI that runs while you sleep', 'Features', false, 6),
('INTERACTIVE VISUALS', 'Live charts & diagrams in chat', 'Features', false, 7),
('VOICE MODE', 'Talk to AI like a person', 'Features', false, 8),
('CONNECTORS', 'Plug AI into Gmail, Drive, Slack', 'Features', false, 9),

-- Apps (6)
('CHATGPT ATLAS', 'The browser with AI built in', 'Apps', true, 1),
('PERPLEXITY COMET', 'Browser that does tasks for you', 'Apps', false, 2),
('CLAUDE DISPATCH', 'Phone controls your desktop AI', 'Apps', false, 3),
('CLAUDE CODE', 'Coding agent that ships features', 'Apps', false, 4),
('CLAUDE DESIGN', 'From idea to prototype, by chat', 'Apps', false, 5),
('GOOGLE AI STUDIO', 'Try AI features before they ship', 'Apps', false, 6),

-- Workflows (6)
('PPT', 'Make a deck in 60 seconds', 'Workflows', false, 1),
('DATA & DASHBOARDS', 'Talk to your spreadsheet', 'Workflows', false, 2),
('INFOGRAPHICS', 'Turn a paragraph into a poster', 'Workflows', false, 3),
('IMAGES & VIDEO', 'From sentence to video', 'Workflows', false, 4),
('EMAIL & DOCS', 'Draft, polish, summarise faster', 'Workflows', false, 5),
('VIBE CODING', 'Build apps by describing them', 'Workflows', false, 6),

-- Skills (4)
('IMPROVE AI RESPONSES', 'Get sharper answers from AI', 'Skills', false, 1),
('SPOT AI IMAGES', 'Tell real from AI-generated', 'Skills', false, 2),
('AI AGENTS', 'When AI does the work for you', 'Skills', false, 3),
('GUARDRAILS', 'Stay safe with AI at work', 'Skills', false, 4);
