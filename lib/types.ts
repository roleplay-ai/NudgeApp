// --- Auth / Profile ---

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  xp: number;
  streak: number;
  last_active: string | null;
};

// --- News ---

export type NewsItem = {
  id: string;
  tag: string;
  tag_color: string;
  title: string;
  body: string;
  url: string | null;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  is_featured: boolean;
};

// --- Trending ---

export type TrendingTopic = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  body: string;
  why_matters: string;
  is_active: boolean;
};

// --- Tools ---

export type Tool = {
  id: string;
  name: string;
  letter: string | null;
  color: string | null;
  company: string | null;
  founded: number | null;
  category: string;
  pricing: string | null;
  best_for: string | null;
  description: string | null;
  url: string | null;
  logo_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  order_index: number;
  pros?: string[];
  cons?: string[];
};

// --- Apply ---

export type ApplyTask = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon_letter: string;
  is_daily: boolean;
  is_published: boolean;
  order_index: number;
  xp_reward: number;
};

export type ApplySlide = {
  id: string;
  task_id: string;
  caption: string;
  prompt_text: string | null;
  mock_type: string;
  image_url: string | null;
  order_index: number;
};

// --- Videos ---

export type WatchVideo = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  duration: string;
  creator: string;
  thumbnail_url: string | null;
  published_at: string;
  is_published: boolean;
  order_index: number;
};

export type VideoOfDay = {
  id: string;
  title: string;
  url: string;
  duration: string;
  creator: string;
  thumbnail_url: string | null;
  is_active: boolean;
  active_date: string;
};

export type ProductOfDay = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  image_url: string | null;
  tool_id: string | null;
  is_active: boolean;
  active_date: string;
};

// --- Learn: Worlds & Modules ---

export type World = {
  id: string;
  slug: string;
  emoji: string;
  title: string;
  description: string | null;
  color: string;
  order_index: number;
  is_published: boolean;
};

export type Module = {
  id: string;
  world_id: string;
  slug: string;
  title: string;
  concepts: string[];
  order_index: number;
  xp_reward: number;
  is_published: boolean;
};

export type ScreenType = "hook" | "idea" | "example" | "why" | "check" | "unlocked";

export type ScreenOption = {
  id: string;
  screen_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
};

export type ScreenToken = {
  id: string;
  screen_id: string;
  token_text: string;
  style: "normal" | "highlight" | "dimmed";
  order_index: number;
};

export type ModuleScreen = {
  id: string;
  module_id: string;
  screen_type: ScreenType;
  order_index: number;
  label: string | null;
  title: string | null;
  body: string | null;
  tone: "neutral" | "good" | "bad" | null;
  question: string | null;
  feedback_correct: string | null;
  feedback_incorrect: string | null;
  next_module_title: string | null;
  screen_options?: ScreenOption[];
  screen_tokens?: ScreenToken[];
};

// --- Glossary ---

export type GlossaryCategory = {
  id: string;
  name: string;
  order_index: number;
};

export type GlossaryTerm = {
  id: string;
  category_id: string | null;
  term: string;
  definition: string;
  example: string | null;
  color: string;
  order_index: number;
  is_published: boolean;
};

// --- Resources ---

export type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  resource_type: string;
  level: string;
  category: string | null;
  author: string | null;
  thumbnail_url: string | null;
  duration_mins: number | null;
  is_featured: boolean;
  is_published: boolean;
  order_index: number;
};
