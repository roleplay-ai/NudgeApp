# Nudgeable AI Fluency — Web App

Responsive web app built with **Next.js 14 + Supabase + Tailwind**. Mobile-friendly, desktop-friendly, deployable on Vercel.

## What's in here

- **User app** at `/` — Home, Learn, Apply, Tools, Today
- **Admin panel** at `/admin` — manage all content (news, videos, tools, glossary, resources, worlds, modules, apply tiles, trending)
- **Auth** — email + password via Supabase
- **Image upload** — Supabase Storage bucket `content`

## Setup (one time)

### 1. Supabase
1. Create a Supabase project at supabase.com.
2. In the SQL Editor, run files in this order from `/supabase/`:
   - `schema.sql` — base tables, RLS, storage bucket
   - `seed.sql` — sample news, videos, tools, glossary
   - `migration_002_worlds.sql` — adds Worlds & Modules
   - `seed_002_worlds.sql` — sample worlds
   - `migration_003_resources.sql` — adds learning Resources
   - `seed_003_resources.sql` — sample resources (Anthropic Academy etc)
   - `migration_004_apply_tiles.sql` — adds Apply tiles, Trending, extends Tools
   - `seed_004_apply_tiles.sql` — seeds the 25 Apply tiles + 1 trending hero

### 2. Environment
Copy `.env.example` → `.env.local` and fill:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Make yourself admin
After you sign up, go to Supabase → Table Editor → `profiles` → find your row → set `role` to `admin`.

### 4. Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

### 5. Deploy
Push to GitHub. Connect to Vercel. Add the two env vars in Vercel project settings. Deploy.

## File structure

```
app/
  (user)/              ← user-facing app
    layout.tsx         ← responsive nav (sidebar desktop, bottom-nav mobile)
    page.tsx           ← Home (news-led)
    learn/             ← Worlds, Glossary, Resources tabs
    apply/             ← 25-tile grid + slideshow
    tools/             ← Tools list with detail modal
    today/             ← News, Videos, Archive tabs
  admin/               ← admin panel
  login/, signup/      ← auth
components/
  user/                ← user-app client components
  admin/               ← admin form helpers, image uploader
lib/
  supabase/            ← client + server helpers
  types.ts             ← all TypeScript types
supabase/              ← SQL migrations + seeds
```

## Adding content

1. Sign in as admin → go to `/admin`.
2. **Trending** → add 1 active hero (shows on home).
3. **News** → add 4–10 news items.
4. **Videos** → add at least one with `is_featured = true` (video of the day).
5. **Tools** → add tools with full pros/cons/pricing. Mark one as Product of Day.
6. **Apply Tiles** → 25 tiles already seeded. For each, click "Slides" and add slides (title + screenshot + body text). Number of slides per tile is flexible.
7. **Worlds** → already seeded with 7 worlds. Add module screens via `/admin/worlds/[id]`.
8. **Glossary** → add AI terms.
9. **Resources** → already seeded with 8 resources.

## Brand
Inter font · Amber `#FFCE00` · Shadow `#221D23` · Blue `#623CEA` · Orange `#F68A29` · Emerald `#23CE68` · Fuchsia `#ED4551` · Dodger `#3696FC`
