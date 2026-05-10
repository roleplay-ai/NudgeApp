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
  /** Short 1-2 sentence teaser shown on the black hero card on Home. */
  brief: string | null;
  url: string | null;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  is_featured: boolean;
};

/** Singleton row: copy for the dark “Nudgeable Brief” hero on Home. */
export type HomeBriefHero = {
  id: string;
  badge_label: string;
  title: string;
  subtitle: string;
  /** If set, shown as the full gray byline (no auto date prefix). */
  byline_override: string | null;
  /** Used with the latest brief news date as: `{date} · {byline_suffix}` when override is empty. */
  byline_suffix: string;
  updated_at?: string;
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

// --- Apply tiles (browse grid + slide decks) ---

export type ApplyPlatform = {
  name: string;
  color?: string | null;
};

export type ApplyTile = {
  id: string;
  title: string;
  subtitle: string;
  group_name: "Features" | "Apps" | "Workflows" | "Skills" | string;
  is_featured: boolean;
  order_index: number;
  /** Card + modal icon (optional); otherwise first letter of title is used. */
  icon_url?: string | null;
  /** Hex background for letter icon when no icon_url. */
  icon_color?: string | null;
  /** Small pill on card, e.g. EDITING (optional). */
  category_tag?: string | null;
  /** Long copy for modal “What it does”. */
  what_it_does?: string | null;
  /** YouTube (or embeddable) watch URL for modal player. */
  video_url?: string | null;
  /** Shown on the card over the preview strip, e.g. ~1 min. */
  estimated_duration?: string | null;
  /** Platforms where the feature exists, e.g. [{ "name": "ChatGPT", "color": "#23CE68" }]. */
  available_in?: ApplyPlatform[] | null;
};

/** Row in public.apply_tile_slides (tile gallery; legacy task UI uses public.apply_slides). */
export type ApplyTileSlide = {
  id: string;
  tile_id: string;
  title: string;
  body: string;
  image_url: string | null;
  order_index: number;
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
  /** Library subcategory: gemini | chatgpt | claude | copilot | ai_foundations | useful */
  subcategory?: string | null;
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

export type HomeWeeklyWatchVideo = {
  id: string;
  slot: number;
  watch_video_id: string;
  updated_at?: string;
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
  is_locked: boolean;
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

// --- Apply Videos ---

export type ApplyVideo = {
  id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  order_index: number;
  is_published: boolean;
  /** Filter chip: Features | Apps | Workflows | Skills */
  group_name?: string | null;
  /** Card pill, e.g. EDITING */
  category_tag?: string | null;
  /** Pipe- or comma-separated names for "Available in" (e.g. ChatGPT | Claude) */
  platforms?: string | null;
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
