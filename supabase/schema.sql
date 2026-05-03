-- ============================================
-- Nudgeable AI Fluency — Database Schema
-- Run this once in Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  xp int not null default 0,
  streak int not null default 0,
  mastery_score int not null default 30,
  level text not null default 'AI Aware',
  last_active_date date,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. NEWS / UPDATES (Today tab)
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  tag text not null,                -- 'FEATURE' | 'TREND' | 'QUICK WIN' | 'MODEL' | 'POLICY'
  action_text text,                 -- "Try today: ..."
  external_url text,
  published_at date not null default current_date,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- 3. VIDEOS (Watchlist)
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  creator text not null,
  duration text,                    -- "8:42"
  category text not null,           -- 'Tutorials' | 'Tools' | 'News' | 'Deep dives'
  youtube_url text not null,
  thumbnail_url text,
  published_at date not null default current_date,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- 4. TOOLS
create table public.tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,           -- 'PPT' | 'Excel' | 'Image' | 'Video' | 'Voice' | 'Coding' | 'Research'
  description text,
  url text,
  tag text,                         -- "Best overall" etc
  is_product_of_day boolean default false,
  created_at timestamptz default now()
);

-- 5. GLOSSARY
create table public.glossary (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  definition text not null,
  created_at timestamptz default now()
);

-- 6. LESSONS (Learn → Fundamentals)
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

-- 7. QUESTIONS (inside lessons)
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question_text text not null,
  options jsonb not null,           -- ["opt1","opt2",...]
  correct_index int not null,
  explanation text,
  order_index int not null default 0
);

-- 8. APPLY TASKS
create table public.apply_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,           -- 'PPT' | 'Excel' | 'Email' | etc
  description text,
  tool_name text,                   -- "Gamma"
  prompt_template text not null,
  duration_min int default 5,
  xp_reward int default 30,
  is_daily boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

-- 9. APPLY TASK STEPS (admin can upload screenshots per step)
create table public.apply_task_steps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.apply_tasks(id) on delete cascade,
  step_type text not null,          -- 'intro' | 'input' | 'prompt' | 'paste-guide' | 'evaluate' | 'improve' | 'log'
  title text,
  body text,
  image_url text,                   -- screenshot of Gamma, ChatGPT etc.
  order_index int not null default 0
);

-- 10. USER PROGRESS
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id),
  apply_task_id uuid references public.apply_tasks(id),
  completed_at timestamptz default now(),
  score int
);

-- 11. SKILL SCORES
create table public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_name text not null,         -- 'Clarity' | 'Context' | 'Tool Selection' | etc
  score int not null default 30,
  updated_at timestamptz default now(),
  unique (user_id, skill_name)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.videos enable row level security;
alter table public.tools enable row level security;
alter table public.glossary enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.apply_tasks enable row level security;
alter table public.apply_task_steps enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_skills enable row level security;

-- Helper: is_admin check
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Profiles: user can read/update own; admin can read all
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "admin manages profiles" on public.profiles
  for all using (public.is_admin());

-- Content tables: everyone reads, only admin writes
create policy "anyone reads news" on public.news for select using (true);
create policy "admin writes news" on public.news for all using (public.is_admin());

create policy "anyone reads videos" on public.videos for select using (true);
create policy "admin writes videos" on public.videos for all using (public.is_admin());

create policy "anyone reads tools" on public.tools for select using (true);
create policy "admin writes tools" on public.tools for all using (public.is_admin());

create policy "anyone reads glossary" on public.glossary for select using (true);
create policy "admin writes glossary" on public.glossary for all using (public.is_admin());

create policy "anyone reads lessons" on public.lessons for select using (true);
create policy "admin writes lessons" on public.lessons for all using (public.is_admin());

create policy "anyone reads questions" on public.questions for select using (true);
create policy "admin writes questions" on public.questions for all using (public.is_admin());

create policy "anyone reads apply tasks" on public.apply_tasks for select using (true);
create policy "admin writes apply tasks" on public.apply_tasks for all using (public.is_admin());

create policy "anyone reads apply steps" on public.apply_task_steps for select using (true);
create policy "admin writes apply steps" on public.apply_task_steps for all using (public.is_admin());

-- User-specific tables
create policy "users read own progress" on public.user_progress
  for select using (auth.uid() = user_id or public.is_admin());
create policy "users insert own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "users read own skills" on public.user_skills
  for select using (auth.uid() = user_id or public.is_admin());
create policy "users upsert own skills" on public.user_skills
  for all using (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET for admin-uploaded images
-- ============================================
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do nothing;

create policy "anyone reads content images" on storage.objects
  for select using (bucket_id = 'content');

create policy "admin uploads content images" on storage.objects
  for insert with check (bucket_id = 'content' and public.is_admin());

create policy "admin updates content images" on storage.objects
  for update using (bucket_id = 'content' and public.is_admin());

create policy "admin deletes content images" on storage.objects
  for delete using (bucket_id = 'content' and public.is_admin());
