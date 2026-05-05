import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import type { NewsItem, ProductOfDay, Resource, Tool, TrendingTopic, WatchVideo } from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";
import FeatureOfWeekCard from "@/components/user/FeatureOfWeekCard";

function resourceTitle(r: Resource & { name?: string }) {
  return r.title || r.name || "Untitled";
}

function formatBriefDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function firstLine(text: string | null | undefined, max = 140): string {
  if (!text?.trim()) return "";
  const line = text.split(/\n+/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

const VIDEO_AVATAR_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];

const HOME_CLAY = "#C07B3A";
const HOME_NAVY = "#1e3a5f";

export default function HomeContent({
  briefNews,
  productOfWeek,
  featureTrending,
  researchResource,
  researchTool,
  libraryVideos,
  topResources,
}: {
  briefNews: NewsItem[];
  productOfWeek: ProductOfDay | null;
  featureTrending: TrendingTopic | null;
  researchResource: Resource | null;
  researchTool: Tool | null;
  libraryVideos: WatchVideo[];
  topResources: Resource[];
}) {
  const briefDate =
    briefNews[0]?.published_at && formatBriefDate(briefNews[0].published_at as unknown as string);
  const ourTake =
    featureTrending?.why_matters?.trim() ||
    "One hour a week on AI fluency is no longer optional.";

  return (
    <div className="space-y-10 md:space-y-12">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-[1.65rem] font-extrabold text-homeInk tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-homeSubtle mt-2 max-w-xl leading-relaxed">
            60 seconds to know what matters in AI this week.
          </p>
        </div>
      </header>

      {/* Nudgeable Brief — dark hero strip + white digest (reference layout) */}
      {briefNews.length > 0 && (
        <section>
          <div className="rounded-2xl border border-homeInk/10 shadow-md overflow-hidden bg-white">
            <div className="bg-homeInk px-5 pt-6 pb-6 md:px-8 md:pt-8 md:pb-7">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">
                  NUDGEABLE BRIEF
                </span>
                {briefDate ? (
                  <span className="text-[12px] text-homeWarmGray">{briefDate} · Nudgeable Editorial</span>
                ) : (
                  <span className="text-[12px] text-homeWarmGray">Nudgeable Editorial</span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight">
                What changed in AI — fast
              </h2>
              <p className="text-sm text-homeWarmGray mt-3 max-w-2xl leading-relaxed">
                Three headlines worth your attention — curated, plain English, links when you want more.
              </p>
            </div>

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

            <div className="px-5 md:px-8 py-5 bg-homeCanvas/70 border-t border-homeDivider flex gap-3 items-start">
              <span className="text-lg shrink-0 leading-none" aria-hidden>
                💡
              </span>
              <div>
                <div className="text-[10px] font-bold tracking-[0.18em] text-homeClay mb-1">OUR TAKE</div>
                <p className="text-sm text-homeInk leading-relaxed">{ourTake}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* This week&apos;s picks */}
      {(productOfWeek || featureTrending || researchResource || researchTool) && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-extrabold text-homeInk">This week&apos;s picks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {productOfWeek && (
              <PickProductCard product={productOfWeek} />
            )}
            {featureTrending && <FeatureOfWeekCard trending={featureTrending} hideTopAccentBar />}
            {(researchResource || researchTool) && (
              <PickResearchCard resource={researchResource} tool={researchTool} />
            )}
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

      {/* Top 3 resources of the week */}
      {topResources.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-extrabold text-homeInk">Top resources this week</h2>
            <Link
              href="/learn"
              className="text-xs font-semibold text-homeClay hover:underline inline-flex items-center gap-0.5"
            >
              Full list <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topResources.map((r) => {
              const title = resourceTitle(r);
              const type = (r.resource_type || r.category || "Resource").toUpperCase();
              const metaBits = [r.author, r.duration_mins != null ? `${r.duration_mins} min` : null].filter(Boolean);
              const meta = metaBits.length ? metaBits.join(" · ") : "Nudgeable";
              const tagColor =
                type.includes("GUIDE") || type.includes("COURSE")
                  ? "#623CEA"
                  : type.includes("ESSAY") || type.includes("TUTORIAL")
                    ? "#F59E0B"
                    : "#3696FC";
              return (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 bg-white rounded-2xl border border-homeDivider p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-homeBodyMuted sm:hidden w-full justify-between">
                    <span
                      className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ background: tagColor }}
                    >
                      {type}
                    </span>
                    <ExternalLink size={14} className="text-homeClay shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="hidden sm:flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
                        style={{ background: tagColor }}
                      >
                        {type}
                      </span>
                      <span className="text-[11px] text-homeBodyMuted">{meta}</span>
                    </div>
                    <div className="text-sm font-extrabold text-homeInk leading-snug mb-1">{title}</div>
                    <p className="text-xs text-homeBodyMuted line-clamp-2 leading-relaxed sm:pr-8">
                      {r.description || "Open to explore this pick on the provider site."}
                    </p>
                    <div className="mt-2 text-[11px] text-homeBodyMuted sm:hidden">{meta}</div>
                  </div>
                  <div className="hidden sm:flex shrink-0 items-start pt-0.5">
                    <span className="text-xs font-bold text-homeClay inline-flex items-center gap-1">
                      Open <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              );
            })}
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

function PickProductCard({ product }: { product: ProductOfDay }) {
  const accent = HOME_CLAY;
  const href = product.url || "/tools";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl border border-homeDivider shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
    >
      <div className="h-1 w-full shrink-0" style={{ background: accent }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: accent }}>
          PRODUCT OF THE WEEK
        </div>
        <div className="text-lg font-extrabold text-homeInk leading-snug mb-0.5">{product.name}</div>
        {product.tagline ? (
          <div className="text-[11px] text-homeBodyMuted mb-2">{product.tagline}</div>
        ) : null}
        <p className="text-xs text-homeBodyMuted leading-relaxed line-clamp-3 mb-4 flex-1">{product.description}</p>
        <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed mt-auto" style={{ background: `${accent}14` }}>
          <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: accent }}>
            WHY IT MATTERS
          </div>
          <p className="text-homeInk line-clamp-3">{product.tagline || product.description}</p>
        </div>
        <span className="text-xs font-bold inline-flex items-center gap-1" style={{ color: accent }}>
          Learn more <ArrowRight size={12} />
        </span>
      </div>
    </a>
  );
}

function PickResearchCard({ resource, tool }: { resource: Resource | null; tool: Tool | null }) {
  const accent = HOME_NAVY;
  if (resource) {
    const title = resourceTitle(resource);
    const byline = resource.author || resource.category || "Curated read";
    const href = resource.url;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl border border-homeDivider shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
      >
        <div className="p-5 flex flex-col flex-1">
          <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: accent }}>
            RESEARCH OF THE WEEK
          </div>
          <div className="text-lg font-extrabold text-homeInk leading-snug mb-0.5">{title}</div>
          <div className="text-[11px] text-homeBodyMuted mb-2">{byline}</div>
          <p className="text-xs text-homeBodyMuted leading-relaxed line-clamp-3 mb-4 flex-1">
            {resource.description || "Deep dive worth your attention this week."}
          </p>
          <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed mt-auto" style={{ background: `${accent}22` }}>
            <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: accent }}>
              WHY IT MATTERS
            </div>
            <p className="text-homeInk line-clamp-3">
              {firstLine(resource.description, 200) || "Staying current on research shapes how you use models."}
            </p>
          </div>
          <span className="text-xs font-bold inline-flex items-center gap-1" style={{ color: accent }}>
            Open <ExternalLink size={12} />
          </span>
        </div>
      </a>
    );
  }
  if (tool) {
    const href = tool.url || "#";
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl border border-homeDivider shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
      >
        <div className="p-5 flex flex-col flex-1">
          <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: accent }}>
            RESEARCH OF THE WEEK
          </div>
          <div className="text-lg font-extrabold text-homeInk leading-snug mb-0.5">{tool.name}</div>
          <div className="text-[11px] text-homeBodyMuted mb-2">{tool.company || tool.category}</div>
          <p className="text-xs text-homeBodyMuted leading-relaxed line-clamp-3 mb-4 flex-1">
            {tool.description || tool.best_for || "Tool pick for research-style workflows."}
          </p>
          <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed mt-auto" style={{ background: `${accent}22` }}>
            <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: accent }}>
              WHY IT MATTERS
            </div>
            <p className="text-homeInk line-clamp-3">
              {tool.best_for || tool.description || "Explore capabilities on the vendor site."}
            </p>
          </div>
          <span className="text-xs font-bold inline-flex items-center gap-1" style={{ color: accent }}>
            Learn more <ArrowRight size={12} />
          </span>
        </div>
      </a>
    );
  }
  return null;
}
