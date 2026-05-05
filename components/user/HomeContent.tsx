import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  ApplyVideo,
  HomeBriefHero,
  Module,
  NewsItem,
  ProductOfDay,
  WatchVideo,
  World,
} from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";

function formatBriefDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

const VIDEO_AVATAR_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];

const HOME_CLAY = "#C07B3A";

const HERO_FALLBACK = {
  badge_label: "NUDGEABLE BRIEF",
  title: "What changed in AI — fast",
  subtitle:
    "Three headlines worth your attention — curated, plain English, links when you want more.",
  byline_suffix: "Nudgeable Editorial",
};

export default function HomeContent({
  briefNews,
  briefHero,
  productOfWeek,
  libraryVideos,
  worlds,
  modules,
  applyMidVideos,
}: {
  briefNews: NewsItem[];
  briefHero: HomeBriefHero | null;
  productOfWeek: ProductOfDay | null;
  libraryVideos: WatchVideo[];
  worlds: World[];
  modules: Module[];
  applyMidVideos: ApplyVideo[];
}) {
  const briefDate =
    briefNews[0]?.published_at && formatBriefDate(briefNews[0].published_at as unknown as string);
  const learnWorlds = worlds.slice(0, 3);

  const showBriefHero = briefNews.length > 0 || !!briefHero;
  const heroBadge = briefHero?.badge_label?.trim() || HERO_FALLBACK.badge_label;
  const heroTitle = briefHero?.title?.trim() || HERO_FALLBACK.title;
  const heroSubtitle = briefHero?.subtitle?.trim() || HERO_FALLBACK.subtitle;
  const bylineSuffix = briefHero?.byline_suffix?.trim() || HERO_FALLBACK.byline_suffix;
  const bylineOverride = briefHero?.byline_override?.trim();
  const heroByline = bylineOverride
    ? bylineOverride
    : briefDate
      ? `${briefDate} · ${bylineSuffix}`
      : bylineSuffix;

  return (
    <div className="space-y-10 md:space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-[1.65rem] font-extrabold text-homeInk tracking-tight">
            Welcome back
          </h1>
          <p className="text-[15px] leading-relaxed text-homeBodyMuted max-w-xl text-pretty">
            {"Here's what's happening in AI — and everything you need to get fluent."}
          </p>
        </div>
      </header>

      {/* Nudgeable Brief hero — copy from Admin → Brief hero */}
      {showBriefHero && (
        <section aria-labelledby="brief-hero-heading">
          <div className="rounded-2xl border border-homeInk/10 shadow-md overflow-hidden bg-homeInk px-5 pt-6 pb-6 md:px-8 md:pt-8 md:pb-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">
                {heroBadge}
              </span>
              <span className="text-[12px] text-homeWarmGray">{heroByline}</span>
            </div>
            <h2
              id="brief-hero-heading"
              className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight"
            >
              {heroTitle}
            </h2>
            <p className="text-sm text-homeWarmGray mt-3 max-w-2xl leading-relaxed">{heroSubtitle}</p>
          </div>
        </section>
      )}

      {/* Nudgeable Brief — this week's headlines */}
      {briefNews.length > 0 && (
        <section aria-label="This week in the brief">
          <div className="rounded-2xl border border-homeInk/10 shadow-md overflow-hidden bg-white">
            <div className="px-5 md:px-8 pt-6 pb-2">
              <div className="text-[11px] font-bold tracking-[0.14em] text-homeInk/80 mb-3">THIS WEEK</div>
              <div className="h-px bg-homeDivider mb-5" />
            </div>

            <div className="divide-y divide-homeDivider">
              {briefNews.slice(0, 3).map((n, i) => {
                const href = n.url || "#";
                const bulletStrong = i < 2;
                return (
                  <div key={n.id} className="px-5 md:px-8 py-4 flex gap-4 items-start">
                    <span
                      className="mt-2 h-2 w-2 rounded-full shrink-0"
                      style={{ background: bulletStrong ? "#ef4444" : "#d0c4b4" }}
                      aria-hidden
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-homeInk leading-snug mb-1">{n.title}</div>
                      <p className="text-xs text-homeBodyMuted leading-relaxed line-clamp-2 mb-1">{n.body}</p>
                    </div>
                    {n.url ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-homeClay hover:underline shrink-0 inline-flex items-center gap-0.5 pt-1"
                      >
                        Read <ArrowRight size={12} />
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Middle row — matches reference: product, learn fundamentals, AI features */}
      {(productOfWeek || learnWorlds.length > 0 || applyMidVideos.length > 0) && (
        <section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
            {productOfWeek ? <HomeMidProductCard product={productOfWeek} /> : null}
            {learnWorlds.length > 0 ? (
              <HomeMidLearnCard worlds={learnWorlds} modules={modules} />
            ) : null}
            {applyMidVideos.length > 0 ? <HomeMidFeaturesCard videos={applyMidVideos} /> : null}
          </div>
        </section>
      )}

      {/* Watch this week — compact dark thumbs inside white shell (reference HTML) */}
      {libraryVideos.length > 0 && (
        <section>
          <div className="rounded-xl bg-white border border-homeShellLine px-5 py-[18px] shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-bold text-homeInk">Watch this week</span>
              <Link
                href="/library"
                className="text-xs font-semibold text-homeClay hover:underline inline-flex items-center gap-0.5 no-underline"
              >
                All videos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {libraryVideos.slice(0, 4).map((v) => (
                <WatchWeekThumb key={v.id} video={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discovery cards — Learn resources, Tools, Glossary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 pt-2">
        <HomeDiscoveryCard
          href="/learn?tab=resources"
          emoji="📚"
          title="Learning Resources"
          description="Curated courses from Anthropic, OpenAI, Google — organised by level."
          cta="Browse resources →"
          accent="green"
        />
        <HomeDiscoveryCard
          href="/tools"
          emoji="🔧"
          title="Popular AI Tools"
          description="Vetted picks with honest pros, cons, and who they're best for."
          cta="Explore tools →"
          accent="navy"
        />
        <HomeDiscoveryCard
          href="/learn?tab=glossary"
          emoji="📖"
          title="AI Glossary"
          description="Every AI term you'll encounter — defined simply, searchable A–Z."
          cta="Open glossary →"
          accent="purple"
        />
      </section>
    </div>
  );
}

function WatchWeekThumb({ video }: { video: WatchVideo }) {
  const thumb = resolveVideoThumbnailUrl(video.thumbnail_url, video.url);
  const href = video.url || "#";
  const creatorColor =
    VIDEO_AVATAR_COLORS[(video.creator?.charCodeAt(0) || 0) % VIDEO_AVATAR_COLORS.length];
  const letter = video.creator?.[0]?.toUpperCase() || "?";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 w-full flex-col overflow-hidden rounded-[10px] bg-homeInk shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] no-underline"
    >
      <div
        className="relative flex h-[90px] w-full flex-shrink-0 items-center justify-center overflow-hidden"
        style={
          thumb ? undefined : { background: `linear-gradient(135deg, ${creatorColor}22, #1c1814)` }
        }
      >
        {thumb ? (
          <>
            <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
          </>
        ) : null}
        <div
          className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.15] backdrop-blur-[4px] transition-colors group-hover:bg-homeClay"
          aria-hidden
        >
          <span className="pl-[2px] text-[11px] leading-none text-white">▶</span>
        </div>
        {video.duration ? (
          <div className="absolute bottom-[5px] right-[7px] rounded-[3px] bg-black/70 px-[5px] py-px font-mono text-[10px] leading-tight text-white">
            {video.duration}
          </div>
        ) : null}
        <div
          className="absolute left-2 top-[7px] flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: creatorColor }}
        >
          {letter}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="mb-1 truncate text-[11px] text-homeVideoMeta">{video.creator || "Nudgeable"}</div>
        <div className="line-clamp-2 text-xs font-semibold leading-snug text-homeDivider">{video.title}</div>
      </div>
    </a>
  );
}

function HomeDiscoveryCard({
  href,
  emoji,
  title,
  description,
  cta,
  accent,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
  cta: string;
  accent: "green" | "navy" | "purple";
}) {
  /* Solid fills match reference wireframe: #2d5a3d, #1e3a5f, #4a2060 */
  const surface =
    accent === "green"
      ? "bg-homeCtaGreen border-homeCtaGreen"
      : accent === "navy"
        ? "bg-homeCtaNavy border-homeCtaNavy"
        : "bg-homeCtaPurple border-homeCtaPurple";

  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl border border-black/10 shadow-md transition hover:brightness-[1.06] hover:shadow-lg overflow-hidden no-underline h-full min-h-[220px] ${surface}`}
    >
      <div className="p-6 pb-6 flex flex-col flex-1 text-white">
        <span className="text-[2.35rem] leading-none mb-4 drop-shadow-sm" aria-hidden>
          {emoji}
        </span>
        <h3 className="text-lg font-extrabold text-white tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-white/85 leading-relaxed flex-1">{description}</p>
        <span className="mt-5 text-sm font-bold text-white group-hover:underline decoration-white/70 underline-offset-2">
          {cta}
        </span>
      </div>
    </Link>
  );
}

function HomeMidProductCard({ product }: { product: ProductOfDay }) {
  const href = product.url || "/tools";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full cursor-pointer flex-col rounded-xl border border-homeShellLine bg-white px-5 py-[18px] shadow-none transition-[box-shadow] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] no-underline"
    >
      <div className="mb-3">
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-homeClay">
          PRODUCT OF THE WEEK
        </span>
        <div className="mt-1.5 h-px w-full" style={{ background: `${HOME_CLAY}4d` }} />
      </div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-homeInk text-[22px] leading-none">
          🤖
        </div>
        <div className="min-w-0">
          <div className="text-[18px] font-bold leading-tight text-homeInk">{product.name}</div>
          {product.tagline ? <div className="text-[11px] text-homeSubtle">{product.tagline}</div> : null}
        </div>
      </div>
      <p className="flex-1 text-pretty text-[13px] leading-relaxed text-homeBodyMuted">{product.description}</p>
      <span className="mt-3.5 inline-block text-xs font-semibold text-homeClay">Learn more →</span>
    </a>
  );
}

function HomeMidLearnCard({ worlds, modules }: { worlds: World[]; modules: Module[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-homeShellLine bg-white px-5 py-[18px]">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-homeInk">Learn AI fundamentals</span>
        <Link href="/learn" className="shrink-0 text-xs font-semibold text-homeClay hover:underline">
          Start learning →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {worlds.map((w) => {
          const wMods = modules.filter((m) => m.world_id === w.id);
          const href = wMods[0]?.id ? `/learn/${wMods[0].id}` : "/learn";
          return (
            <Link
              key={w.id}
              href={href}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#ece8e0] bg-[#faf8f4] px-3 py-2.5 transition-colors hover:bg-homeCanvas no-underline"
            >
              <span className="shrink-0 text-xl leading-none" aria-hidden>
                {w.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-homeInk">{w.title}</span>
                </div>
                <span className="text-[11px] text-homeSubtle">
                  {wMods.length} module{wMods.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className="shrink-0 text-sm text-[#c0b0a0]" aria-hidden>
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function applyVideoEmoji(group: string | null | undefined): string {
  const g = (group || "").toLowerCase();
  if (g.includes("workflow")) return "⚙️";
  if (g.includes("app")) return "📱";
  if (g.includes("skill")) return "🎯";
  return "✨";
}

function applyVideoBlurb(description: string | null | undefined): string {
  if (!description?.trim()) return "";
  const cleaned = description.replace(/\n*\[seed:ai-features-guide-v1]\s*$/i, "").trim();
  const line = cleaned.split(/\n+/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  return line.length > 96 ? `${line.slice(0, 94)}…` : line;
}

function HomeMidFeaturesCard({ videos }: { videos: ApplyVideo[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-homeShellLine bg-white px-5 py-[18px]">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-homeInk">Explore common AI features</span>
        <Link href="/apply" className="shrink-0 text-xs font-semibold text-homeClay hover:underline">
          See all →
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {videos.map((v) => {
          const tag = v.category_tag?.trim();
          const blurb = applyVideoBlurb(v.description);
          return (
            <Link
              key={v.id}
              href="/apply"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#ece8e0] bg-[#faf8f4] px-3 py-2.5 transition-colors hover:bg-homeCanvas no-underline"
            >
              <span className="shrink-0 text-xl leading-none" aria-hidden>
                {applyVideoEmoji(v.group_name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="block text-[13px] font-semibold text-homeInk">{v.title}</span>
                  {tag ? (
                    <span className="rounded bg-homeClay px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.07em] text-white">
                      {tag}
                    </span>
                  ) : null}
                </div>
                {blurb ? <span className="text-[11px] text-homeSubtle">{blurb}</span> : null}
              </div>
              <span className="shrink-0 rounded px-[7px] py-0.5 font-mono text-[10px] text-homeNavMuted bg-homeDivider">
                {v.duration?.trim() || "~2 min"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
