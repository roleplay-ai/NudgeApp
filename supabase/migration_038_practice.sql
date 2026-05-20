-- migration_038_practice.sql
-- Practice page: activities, rubrics, sessions, messages, scores

-- Activities (admin-created practice tasks)
CREATE TABLE IF NOT EXISTS practice_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Prompt Engineering',
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  time_minutes INT NOT NULL DEFAULT 15,
  xp_reward INT NOT NULL DEFAULT 60,
  icon TEXT DEFAULT '✦',
  color TEXT DEFAULT '#7C3AED',
  assessment_prompt TEXT,
  hint_chips TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rubric criteria per activity (admin-defined)
CREATE TABLE IF NOT EXISTS practice_rubrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES practice_activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_score INT NOT NULL DEFAULT 25,
  sort_order INT DEFAULT 0
);

-- A user's attempt at an activity (one per attempt)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES practice_activities(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  total_score INT,
  max_possible INT,
  messages_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual chat messages within a session
CREATE TABLE IF NOT EXISTS practice_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Per-rubric scores after submission
CREATE TABLE IF NOT EXISTS practice_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  rubric_id UUID NOT NULL REFERENCES practice_rubrics(id) ON DELETE CASCADE,
  score INT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE practice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scores ENABLE ROW LEVEL SECURITY;

-- Activities: anyone can read published, admin can manage
CREATE POLICY "activities_read" ON practice_activities FOR SELECT USING (is_published = true);
CREATE POLICY "activities_admin" ON practice_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Rubrics: visible if activity is published
CREATE POLICY "rubrics_read" ON practice_rubrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM practice_activities WHERE id = activity_id AND is_published = true)
);
CREATE POLICY "rubrics_admin" ON practice_rubrics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sessions: users own their own sessions
CREATE POLICY "sessions_own" ON practice_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "sessions_admin" ON practice_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages: accessible through session ownership
CREATE POLICY "messages_own" ON practice_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM practice_sessions WHERE id = session_id AND user_id = auth.uid())
);

-- Scores: accessible through session ownership
CREATE POLICY "scores_own" ON practice_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM practice_sessions WHERE id = session_id AND user_id = auth.uid())
);
