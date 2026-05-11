---
name: Nudgeable DB Feature Phases
overview: Add 12 database features to the Nudgeable app across three migration phases, all landing in `supabase/migration_024_*.sql` through `migration_034_*.sql`. The main branch is currently at migration 023; every migration in the worktree (`elated-bardeen-1398b6`) is a draft ready to be finalized and applied.
todos:
  - id: phase1-024
    content: Apply migration_024_fix_legacy.sql (housekeeping prerequisite)
    status: completed
  - id: phase1-025
    content: "Apply migration_025_lockable_content.sql — Feature A: is_locked + kind columns on worlds/videos/news/tools/resources/apply_videos"
    status: completed
  - id: phase1-026
    content: "Apply migration_026_points_rules_and_transactions.sql — Feature B+I: point_rules, point_transactions, award_points() function with streak logic"
    status: completed
  - id: phase1-029
    content: "Apply migration_029_coupons.sql — Feature E: coupons table with authenticated-only RLS"
    status: completed
  - id: phase2-028
    content: "Apply migration_028_quizzes.sql — Feature D: quizzes, quiz_questions, user_quiz_attempts (no-redo), user_quiz_answers"
    status: pending
  - id: phase2-030
    content: "Apply migration_030_leaderboard_and_optin.sql — Feature F: show_on_leaderboard/leaderboard_display_name on profiles, leaderboard view"
    status: pending
  - id: phase2-033
    content: "Apply migration_033_milestones.sql — Feature J schema: milestones + user_milestones tables (detection logic activates in Phase 3)"
    status: pending
  - id: phase2-034
    content: "Apply migration_034_feedback.sql — Feature K: content_feedback, app_feedback, content_feedback_aggregate view"
    status: pending
  - id: phase3-027
    content: "Apply migration_027_user_content_interactions.sql — Feature C+L: user_content_interactions with polymorphic trigger; enables Watched/Unwatched filter and full milestone detection"
    status: pending
  - id: phase3-031
    content: "Apply migration_031_company_detection.sql — Feature G: company_domain/company_name on profiles + auto-populate trigger + backfill"
    status: pending
  - id: phase3-032
    content: "Apply migration_032_badges.sql — Feature H: badges + user_badges tables; update award_points() to auto-award on threshold crossing"
    status: pending
isProject: false
---

# Nudgeable DB Feature Phases — Schema Migration Plan

## Baseline context

- **Current main branch:** migrations up to `migration_023_analytics_user_id.sql`
- **Draft migrations 024–034** exist in the worktree at `.claude/worktrees/elated-bardeen-1398b6/supabase/`
- All migrations are additive (no drops of existing tables/columns) and idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
- The `is_admin()` helper and `handle_new_user()` trigger in [`supabase/schema.sql`](supabase/schema.sql) are reused, not rewritten
- **Streak (Feature I)** has no dedicated migration — its logic ships embedded inside `award_points()` in Phase 1

---

## Phase 1 — Core engagement infrastructure

**Goal:** Lock content for guests, introduce the points economy, and add the login coupon.

### `migration_024_fix_legacy.sql` *(prerequisite — must run first)*
- Adds the missing `brief text` column to `public.news` (fixes broken `migration_020`)
- Repoints `home_weekly_watch_videos.watch_video_id` FK to `public.videos` (fixes broken `migration_016`)
- Pure housekeeping; no user-facing behaviour changes

### `migration_025_lockable_content.sql` — Feature A
New columns on existing tables (all `boolean NOT NULL DEFAULT false`):

| Table | New column |
|-------|------------|
| `worlds` | `is_locked` |
| `videos` | `is_locked` |
| `news` | `is_locked`, `kind text DEFAULT 'news' CHECK (kind IN ('news','article'))` |
| `tools` | `is_locked` |
| `resources` | `is_locked` |
| `apply_videos` | `is_locked` |

`modules.is_locked` already exists (migration 018); no change needed. Locking is UI-only — RLS does not hide locked rows from anonymous users (padlock + CTA is shown instead).

### `migration_026_points_rules_and_transactions.sql` — Features B + I (streak)
**New tables:**
- `point_rules (id, content_type UNIQUE, default_points, updated_at, updated_by → profiles)`
- `point_transactions (id, user_id → profiles ON DELETE SET NULL, source_type, source_id, idempotency_key, points, awarded_at)` — UNIQUE `(user_id, source_type, source_id, idempotency_key)` for idempotency

**New columns on content tables:**
- `modules.points_award int` (nullable per-item override)
- `videos.points_award int`
- `news.points_award int`
- `apply_videos.points_award int`

**New function:** `award_points(p_user, p_source_type, p_source_id, p_points, p_idempotency_key)` — SECURITY DEFINER; does `SELECT … FOR UPDATE` on `profiles`, inserts `point_transactions` (no-op on duplicate), increments `profiles.xp`, and updates `profiles.streak` + `profiles.last_active_date` in the same locked window:
```sql
streak = CASE
  WHEN last_active_date = current_date     THEN streak
  WHEN last_active_date = current_date - 1 THEN streak + 1
  ELSE 1
END,
last_active_date = current_date
```

**Seeded defaults in `point_rules`:** module=50, video=10, news=5, apply_video=15, quiz_question=10.

### `migration_029_coupons.sql` — Feature E
**New table:** `coupons (id, code UNIQUE, discount_percent CHECK 0–100, valid_from, valid_until, is_active, created_at)`

RLS:
- `SELECT` — authenticated users only, and only for rows where `is_active AND now() BETWEEN valid_from AND COALESCE(valid_until, 'infinity')`
- `ALL` — `is_admin()` only

---

## Phase 2 — Quizzes, leaderboard, milestones skeleton, feedback

**Goal:** Enable quiz-based learning, surface the leaderboard, create milestone infrastructure, and collect user feedback.

### `migration_028_quizzes.sql` — Feature D
**New tables:**
- `quizzes (id, module_id → modules ON DELETE CASCADE, title, order_index, pass_threshold_pct CHECK 0–100 DEFAULT 70, points_per_correct, version INT DEFAULT 1, created_at)`
- `quiz_questions (id, quiz_id → quizzes ON DELETE CASCADE, question_text, options JSONB, correct_index, explanation, order_index)`
- `user_quiz_attempts (id, user_id → profiles ON DELETE SET NULL, quiz_id → quizzes ON DELETE CASCADE, quiz_version, submitted_at, score, total_questions, points_awarded)` — UNIQUE `(user_id, quiz_id, quiz_version)` enforces **no retake**; admin bumps `version` to re-open
- `user_quiz_answers (id, attempt_id → user_quiz_attempts ON DELETE CASCADE, question_id → quiz_questions ON DELETE SET NULL, selected_index, is_correct)`

**New column on existing table:**
- `module_screens.linked_quiz_id uuid → quizzes ON DELETE SET NULL` (links a "check" screen to a full quiz)

### `migration_030_leaderboard_and_optin.sql` — Feature F
**New columns on `profiles`:**
- `show_on_leaderboard boolean NOT NULL DEFAULT true` (opt-out by default)
- `leaderboard_display_name text` (falls back to `full_name` in view)

**New view:**
```sql
CREATE VIEW public.leaderboard
  WITH (security_invoker = true) AS
  SELECT id,
         COALESCE(leaderboard_display_name, full_name) AS display_name,
         xp,
         ROW_NUMBER() OVER (ORDER BY xp DESC, created_at ASC) AS rank
  FROM profiles WHERE show_on_leaderboard = true;
```

### `migration_033_milestones.sql` — Feature J (schema only in Phase 2; full detection activates in Phase 3 when Feature C ships)
**New tables:**
- `milestones (id, name, description, milestone_type CHECK ('world_complete','track_complete','category_complete'), criteria JSONB, criteria_summary, bonus_points INT DEFAULT 0, is_active BOOL DEFAULT true, created_at)` — GIN index on `criteria`; CHECK that `criteria` contains the expected key per type
- `user_milestones (id, user_id → profiles ON DELETE CASCADE, milestone_id → milestones ON DELETE CASCADE, achieved_at)` — UNIQUE `(user_id, milestone_id)`

Note: milestone detection logic in the app queries `user_content_interactions` (Feature C). That table does not exist until Phase 3 — create the tables now, wire up detection in Phase 3.

### `migration_034_feedback.sql` — Feature K
**New tables:**
- `content_feedback (id, user_id → profiles ON DELETE SET NULL, content_type, content_id, rating CHECK 1–5, comment, created_at)` — CHECK: at least one of `rating`/`comment` is non-null
- `app_feedback (id, user_id → profiles ON DELETE SET NULL, rating CHECK 1–5, comment, created_at)` — same check

**New view:** `content_feedback_aggregate (content_type, content_id, avg_rating, rating_count)` — publicly readable, `security_invoker = false`

---

## Phase 3 — Progress tracking, badges, company detection, watched filter

**Goal:** Full per-user content state (the hub that activates milestones, the filter UX, and badges).

### `migration_027_user_content_interactions.sql` — Features C + L
**New table:**
```
user_content_interactions (
  id, user_id → profiles ON DELETE CASCADE,
  content_type CHECK ('module','video','news','apply_video','tool','resource'),
  content_id uuid,
  status CHECK (pairs enforced per content_type — see below),
  last_position int DEFAULT 0,
  points_tx_id → point_transactions ON DELETE SET NULL,
  first_seen_at, updated_at, completed_at
)
UNIQUE (user_id, content_type, content_id)
```

Status rules enforced by CHECK:
- `module` → `in_progress` or `completed`
- `video` / `apply_video` → `watched` or `in_progress`
- `news` / `tool` / `resource` → `read`

**Polymorphic FK trigger** (`check_uci_content_ref BEFORE INSERT OR UPDATE`): validates `content_id` exists in the correct table for the given `content_type`; raises `23503` if not.

**Indexes:**
- `(user_id, content_type, updated_at DESC)` — for "my history" queries
- partial `(content_type, content_id) WHERE status IN ('watched','completed','read')` — for aggregate counts

Feature L (Watched/Unwatched filter) requires no migration: the app sorts/filters via `LEFT JOIN user_content_interactions` with `ORDER BY (uci.updated_at IS NOT NULL) ASC, content.published_at DESC`.

### `migration_031_company_detection.sql` — Feature G
**New columns on `profiles`:** `company_domain text`, `company_name text`

**New trigger** `profiles_company_domain BEFORE INSERT OR UPDATE OF email ON profiles`:
```sql
new.company_domain := lower(split_part(new.email, '@', 2));
```

**Backfill:** `UPDATE profiles SET company_domain = lower(split_part(email,'@',2)) WHERE company_domain IS NULL AND email IS NOT NULL`

Free-email domains (gmail.com etc.) are stored; app filters them out when displaying B2B labels. `company_name` starts null — enriched by admin or future job.

### `migration_032_badges.sql` — Feature H
**New tables:**
- `badges (id, level INT UNIQUE CHECK 1–5, name, description, icon_url, color, points_threshold INT CHECK ≥ 0, created_at)`
- `user_badges (id, user_id → profiles ON DELETE CASCADE, badge_id → badges ON DELETE CASCADE, earned_at)` — UNIQUE `(user_id, badge_id)`

**`award_points()` is updated** to add, after incrementing `xp`: check any `badges` rows where `points_threshold <= new_xp AND points_threshold > old_xp`; insert into `user_badges` for any newly crossed thresholds.

---

## Migration execution order

```
Phase 1:  024 → 025 → 026 → 029
Phase 2:  028 → 030 → 033 → 034
Phase 3:  027 → 031 → 032
          (L has no migration; activates via app queries once 027 exists)
```

---

## RLS summary for all new tables

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `point_rules` | anyone | admin | admin | admin |
| `point_transactions` | owner + admin | `award_points()` SECURITY DEFINER | — | admin |
| `user_content_interactions` | owner + admin | owner | owner | owner |
| `quizzes`, `quiz_questions` | anyone | admin | admin | admin |
| `user_quiz_attempts`, `user_quiz_answers` | owner + admin | owner (UNIQUE blocks redo) | — | admin |
| `coupons` | authenticated + valid window | admin | admin | admin |
| `badges`, `milestones` | anyone | admin | admin | admin |
| `user_badges`, `user_milestones` | owner + admin | `award_points()` / app | — | admin |
| `content_feedback`, `app_feedback` | owner + admin | any authenticated | — | admin |
| `leaderboard` view | anyone | — | — | — |
| `content_feedback_aggregate` view | anyone | — | — | — |

---

## Deferred (out of scope for all phases)

- `streak_log` table for daily streak history/analytics
- `tracks` + `track_modules` for curated learning paths (milestones currently use `world_id` via JSONB criteria)
- `companies` normalization table (only `company_domain`/`company_name` on profiles for now)
- Migration of existing `module_screens.screen_type = 'check'` rows into the new `quizzes` schema (admin-driven, one-off)
