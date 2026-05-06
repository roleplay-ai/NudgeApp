"use client";

import Link from "next/link";
import RichText from "@/components/ui/RichText";
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
import { track } from "@/lib/analytics";

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
  const learnWorlds = worlds.slice(0, 3);

  const showBriefHero = briefNews.length > 0 || !!briefHero;
  const heroBadge = briefHero?.badge_label?.trim() || HERO_FALLBACK.badge_label;
  const heroTitle = briefHero?.title?.trim() || HERO_FALLBACK.title;
  const heroSubtitle = briefHero?.subtitle?.trim() || HERO_FALLBACK.subtitle;
  const bylineOverride = briefHero?.byline_override?.trim();
  const todayByline = formatBriefDate(new Date().toISOString());
  const heroByline = bylineOverride || todayByline;

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

      {/* Nudgeable Brief hero — badge/title from Admin → Brief hero; news briefs inline */}
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

            {briefNews.length > 0 ? (
              <ul className="mt-4 space-y-3 list-none">
                {briefNews.map((n) => {
                  const href = n.url || null;
                  const briefText = n.brief?.trim() || n.body?.trim() || null;
                  return (
                    <li key={n.id}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-2.5 items-start group no-underline"
                          onClick={() => track("news_click", { item_id: n.id, title: n.title, url: href })}
                        >
                          <span className="shrink-0 mt-[7px] h-1.5 w-1.5 rounded-full bg-homeClay group-hover:bg-amber transition-colors" aria-hidden />
                          <p className="text-[13px] text-homeWarmGray leading-relaxed group-hover:text-white/90 transition-colors">
                            {briefText || n.title}
                          </p>
                        </a>
                      ) : (
                        <div className="flex gap-2.5 items-start">
                          <span className="shrink-0 mt-[7px] h-1.5 w-1.5 rounded-full bg-homeClay" aria-hidden />
                          <p className="text-[13px] text-homeWarmGray leading-relaxed">
                            {briefText || n.title}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <RichText
                content={heroSubtitle}
                classes={{
                  wrapper: "mt-3 max-w-2xl space-y-2",
                  p: "text-sm text-homeWarmGray leading-relaxed",
                  ul: "space-y-1.5 list-none",
                  li: "flex items-start gap-2 text-sm text-homeWarmGray leading-relaxed",
                  bullet: "shrink-0 text-homeClay mt-0.5 text-base leading-none",
                  strong: "font-bold text-white",
                  em: "italic",
                  code: "font-mono text-[12px] bg-white/10 text-amber px-1.5 py-0.5 rounded",
                }}
              />
            )}
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
      onClick={() => track("video_click", { item_id: video.id, title: video.title, creator: video.creator })}
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
      onClick={() => track("link_click", { title, url: href })}
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
      className="group flex h-full cursor-pointer flex-col rounded-xl overflow-hidden no-underline transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(80,30,180,0.30)]"
      style={{ background: "linear-gradient(145deg,#5B2AB8 0%,#3B1285 55%,#2A0E6A 100%)" }}
      onClick={() => track("product_click", { item_id: product.id, title: product.name, url: href })}
    >
      {/* Top label */}
      <div className="px-5 pt-5 pb-0 flex items-center gap-2">
        <span className="text-amber text-[10px] font-black tracking-[0.2em]">—</span>
        <span className="text-amber text-[10px] font-black tracking-[0.16em] uppercase">
          PRODUCT OF THE WEEK
        </span>
      </div>

      {/* Icon + name */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-[12px] flex items-center justify-center text-[24px] shrink-0"
          style={{ background: "rgba(255,206,0,0.18)", border: "1.5px solid rgba(255,206,0,0.35)" }}
        >
          {product.image_url ? (
            <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-[10px]" />
          ) : "✨"}
        </div>
        <div className="min-w-0">
          <div className="text-[22px] font-extrabold leading-tight text-white tracking-tight">
            {product.name}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="flex-1 px-5 pt-3 text-[13px] leading-relaxed text-white/70 text-pretty">
        {product.description}
      </p>

      {/* Footer */}
      <div className="px-5 pt-3 pb-5 flex items-center justify-between gap-3 mt-2">
        {product.tagline ? (
          <span
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white/80"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.14)" }}
          >
            {product.tagline}
          </span>
        ) : <span />}
        <span
          className="shrink-0 text-[13px] font-bold text-shadow px-4 py-1.5 rounded-full transition group-hover:brightness-95"
          style={{ background: "#FFCE00", boxShadow: "0 2px 12px rgba(255,206,0,0.40)" }}
        >
          Try it →
        </span>
      </div>
    </a>
  );
}

function HomeMidLearnCard({ worlds, modules }: { worlds: World[]; modules: Module[] }) {
  const totalMods = modules.length;
  return (
    <div className="flex h-full flex-col rounded-xl border border-homeShellLine bg-white px-5 py-[18px] shadow-sm">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <div className="text-[15px] font-extrabold text-homeInk leading-tight">Learn AI fundamentals</div>
          <div className="text-[11px] text-homeSubtle mt-0.5">
            {worlds.length} short world{worlds.length !== 1 ? "s" : ""} · ~{Math.max(5, totalMods * 2)} min each
          </div>
        </div>
        <Link
          href="/learn"
          className="shrink-0 text-[12px] font-bold text-homeClay hover:underline no-underline mt-0.5"
        >
          Start →
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {worlds.map((w) => {
          const wMods = modules.filter((m) => m.world_id === w.id);
          const href = `/learn`;
          return (
            <Link
              key={w.id}
              href={href}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm no-underline"
              style={{ borderColor: `${w.color}28`, background: `${w.color}09` }}
              onClick={() => track("learn_click", { item_id: w.id, title: w.title })}
            >
              {/* Emoji icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shrink-0"
                style={{ background: `${w.color}20`, border: `1.5px solid ${w.color}35` }}
              >
                {w.emoji}
              </div>

              {/* Title + count */}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-homeInk leading-tight">{w.title}</div>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color: w.color }}>
                  {wMods.length} module{wMods.length === 1 ? "" : "s"}
                </div>
              </div>

              {/* Right arrow */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ background: `${w.color}18`, border: `1.5px solid ${w.color}35` }}
              >
                <span className="font-black text-[15px]" style={{ color: w.color }}>›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Returns a unique emoji per feature based on its title keywords. */
function featureIcon(title: string | null | undefined): string {
  const t = (title || "").toLowerCase();
  if (t.includes("canvas"))        return "🖊️";
  if (t.includes("gem"))           return "💎";
  if (t.includes("notebook") || t.includes("podcast")) return "🎧";
  if (t.includes("code") || t.includes("codex"))       return "💻";
  if (t.includes("image") || t.includes("dall"))       return "🖼️";
  if (t.includes("voice") || t.includes("audio") || t.includes("speech")) return "🎙️";
  if (t.includes("search") || t.includes("browse"))    return "🔍";
  if (t.includes("summar") || t.includes("tldr"))      return "📋";
  if (t.includes("translat"))      return "🌐";
  if (t.includes("email") || t.includes("write") || t.includes("draft")) return "✉️";
  if (t.includes("chart") || t.includes("data") || t.includes("analys")) return "📊";
  if (t.includes("plan") || t.includes("task") || t.includes("project")) return "📌";
  if (t.includes("present") || t.includes("slide"))    return "📽️";
  if (t.includes("copilot"))       return "🤝";
  if (t.includes("chat"))          return "💬";
  if (t.includes("agent"))         return "🤖";
  if (t.includes("workflow") || t.includes("automat")) return "⚙️";
  if (t.includes("app"))           return "📱";
  if (t.includes("skill") || t.includes("learn"))      return "🎯";
  // Fallback: use first letter-based emoji variety
  const code = (title?.charCodeAt(0) ?? 65) % 6;
  return ["✨", "🔥", "⚡", "🌟", "🚀", "💡"][code];
}

function applyVideoBlurb(description: string | null | undefined): string {
  if (!description?.trim()) return "";
  const cleaned = description.replace(/\n*\[seed:ai-features-guide-v1]\s*$/i, "").trim();
  const line = cleaned.split(/\n+/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  return line.length > 96 ? `${line.slice(0, 94)}…` : line;
}

const GROUP_COLORS: Record<string, string> = {
  Features:  "#A855F7",
  Apps:      "#EC4899",
  Workflows: "#F68A29",
  Skills:    "#3699FC",
};

function featureAccent(group: string | null | undefined): string {
  const g = (group || "").trim();
  return GROUP_COLORS[g] || "#623CEA";
}

function tagVariant(tag: string | null | undefined): { bg: string; color: string } {
  const t = (tag || "").toUpperCase();
  if (t.includes("EDIT"))    return { bg: "rgba(98,60,234,0.12)",  color: "#623CEA" };
  if (t.includes("PERSONAL"))return { bg: "rgba(236,72,153,0.12)", color: "#BE185D" };
  if (t.includes("KNOW"))    return { bg: "rgba(246,138,41,0.14)", color: "#92400E" };
  if (t.includes("WORK"))    return { bg: "rgba(54,153,252,0.13)", color: "#1E40AF" };
  return { bg: "rgba(34,29,35,0.08)", color: "#6B6B6B" };
}

function HomeMidFeaturesCard({ videos }: { videos: ApplyVideo[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-homeShellLine bg-white px-5 py-[18px] shadow-sm">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          <div className="text-[15px] font-extrabold text-homeInk leading-tight">Explore common AI features</div>
          <div className="text-[11px] text-homeSubtle mt-0.5">The features changing how teams work</div>
        </div>
        <Link href="/apply" className="shrink-0 text-[12px] font-bold text-homeClay hover:underline no-underline mt-0.5">
          See all →
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {videos.map((v) => {
          const tag = v.category_tag?.trim();
          const blurb = applyVideoBlurb(v.description);
          const accent = featureAccent(v.group_name);
          const tv = tagVariant(tag);
          return (
            <Link
              key={v.id}
              href="/apply"
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#ece8e0] bg-[#faf8f4] px-3 py-2.5 transition-all hover:shadow-sm no-underline"
              onClick={() => track("apply_click", { item_id: v.id, title: v.title })}
            >
              {/* Per-feature icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[19px] shrink-0"
                style={{ background: `${accent}18`, border: `1.5px solid ${accent}30` }}
              >
                {featureIcon(v.title)}
              </div>

              {/* Title + blurb */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-bold text-homeInk leading-tight">{v.title}</span>
                  {tag && (
                    <span
                      className="text-[8px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-md"
                      style={{ background: tv.bg, color: tv.color }}
                    >
                      {tag}
                    </span>
                  )}
                </div>
                {blurb && (
                  <span className="text-[11px] text-homeSubtle line-clamp-1">{blurb}</span>
                )}
              </div>

              {/* Play button */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{ background: accent }}
              >
                <span className="text-white text-[9px] pl-px font-black">▶</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
