import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink, FileText, Flag, Play, Sparkles } from "lucide-react";
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

const BRIEF_ICONS = [Sparkles, FileText, Flag] as const;

const VIDEO_AVATAR_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];

function formatLibraryVideoDate(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

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
          <div className="text-[11px] font-bold tracking-[2px] text-norange mb-1">WELCOME BACK</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-shadow tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted mt-2 max-w-xl">
            60 seconds to know what matters in AI this week.
          </p>
        </div>
      </header>

      {/* Nudgeable Brief — top 3 news_items */}
      {briefNews.length > 0 && (
        <section>
          <div className="bg-white rounded-2xl border border-nborder shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-nborder/80">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-[0.18em] px-2.5 py-1 rounded-full bg-shadow text-white">
                  NUDGEABLE BRIEF
                </span>
                {briefDate ? (
                  <span className="text-[12px] text-muted">
                    {briefDate} · Nudgeable Editorial
                  </span>
                ) : (
                  <span className="text-[12px] text-muted">Nudgeable Editorial</span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-shadow leading-tight">
                What changed in AI — fast
              </h2>
            </div>
            <div className="divide-y divide-nborder">
              {briefNews.slice(0, 3).map((n, i) => {
                const Icon = BRIEF_ICONS[i % BRIEF_ICONS.length];
                const href = n.url || "#";
                return (
                  <div key={n.id} className="px-5 py-4 flex gap-4 items-start">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-nborder bg-chiffon/60 text-shadow"
                      aria-hidden
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-shadow leading-snug mb-1">{n.title}</div>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-2">{n.body}</p>
                    </div>
                    {n.url ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-dodger hover:underline shrink-0 inline-flex items-center gap-0.5 pt-0.5"
                      >
                        Read more <ArrowRight size={12} />
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 bg-chiffon/80 border-t border-nborder flex gap-3 items-start">
              <span className="text-lg shrink-0" aria-hidden>
                💡
              </span>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-norange mb-0.5">OUR TAKE</div>
                <p className="text-sm text-shadow leading-relaxed">{ourTake}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* This week&apos;s picks */}
      {(productOfWeek || featureTrending || researchResource || researchTool) && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-extrabold text-shadow">This week&apos;s picks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productOfWeek && (
              <PickProductCard product={productOfWeek} />
            )}
            {featureTrending && <FeatureOfWeekCard trending={featureTrending} />}
            {(researchResource || researchTool) && (
              <PickResearchCard resource={researchResource} tool={researchTool} />
            )}
          </div>
        </section>
      )}

      {/* Watch this week — same watch_videos as Library */}
      {libraryVideos.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-extrabold text-shadow">Watch this week</h2>
            <Link
              href="/library"
              className="text-xs font-semibold text-norange hover:underline inline-flex items-center gap-0.5"
            >
              All videos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {libraryVideos.map((v) => {
              const thumb = resolveVideoThumbnailUrl(v.thumbnail_url, v.url);
              const caption = firstLine(v.description, 120);
              const href = v.url || "#";
              const creatorColor =
                VIDEO_AVATAR_COLORS[(v.creator?.charCodeAt(0) || 0) % VIDEO_AVATAR_COLORS.length];
              const when = formatLibraryVideoDate(v.published_at);
              return (
                <a
                  key={v.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-video bg-shadow">
                    {thumb ? (
                      <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-nblue/40 to-shadow">
                        <Play size={40} className="text-white opacity-90" fill="white" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition">
                      <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                        <Play size={26} className="text-shadow ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white bg-black/60">
                      VIDEO
                    </span>
                    {v.duration ? (
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/75 text-white px-1.5 py-0.5 rounded">
                        {v.duration}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-sm font-extrabold text-shadow leading-snug line-clamp-2 mb-1">{v.title}</div>
                    {caption ? <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3">{caption}</p> : null}
                    <div className="mt-auto flex items-center gap-2 pt-1">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shrink-0"
                        style={{ background: creatorColor }}
                      >
                        {v.creator?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-[11px] text-muted font-medium truncate">{v.creator}</span>
                      {when ? (
                        <span className="text-[11px] text-muted ml-auto shrink-0">{when}</span>
                      ) : null}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Top 3 resources of the week */}
      {topResources.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-extrabold text-shadow">Top resources this week</h2>
            <Link
              href="/learn"
              className="text-xs font-semibold text-norange hover:underline inline-flex items-center gap-0.5"
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
                  className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 bg-white rounded-2xl border border-nborder p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted sm:hidden w-full justify-between">
                    <span
                      className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ background: tagColor }}
                    >
                      {type}
                    </span>
                    <ExternalLink size={14} className="text-dodger shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="hidden sm:flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
                        style={{ background: tagColor }}
                      >
                        {type}
                      </span>
                      <span className="text-[11px] text-muted">{meta}</span>
                    </div>
                    <div className="text-sm font-extrabold text-shadow leading-snug mb-1">{title}</div>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed sm:pr-8">
                      {r.description || "Open to explore this pick on the provider site."}
                    </p>
                    <div className="mt-2 text-[11px] text-muted sm:hidden">{meta}</div>
                  </div>
                  <div className="hidden sm:flex shrink-0 items-start pt-0.5">
                    <span className="text-xs font-bold text-dodger inline-flex items-center gap-1">
                      Open <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function PickProductCard({ product }: { product: ProductOfDay }) {
  const accent = "#A855F7";
  const href = product.url || "/tools";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
    >
      <div className="h-1 w-full shrink-0" style={{ background: accent }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: accent }}>
          PRODUCT OF THE WEEK
        </div>
        <div className="text-lg font-extrabold text-shadow leading-snug mb-0.5">{product.name}</div>
        {product.tagline ? <div className="text-[11px] text-muted mb-2">{product.tagline}</div> : null}
        <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4 flex-1">{product.description}</p>
        <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed mt-auto" style={{ background: `${accent}14` }}>
          <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: accent }}>
            WHY IT MATTERS
          </div>
          <p className="text-shadow line-clamp-3">{product.tagline || product.description}</p>
        </div>
        <span className="text-xs font-bold inline-flex items-center gap-1" style={{ color: accent }}>
          Learn more <ArrowRight size={12} />
        </span>
      </div>
    </a>
  );
}

function PickResearchCard({ resource, tool }: { resource: Resource | null; tool: Tool | null }) {
  const accent = "#3B82F6";
  if (resource) {
    const title = resourceTitle(resource);
    const byline = resource.author || resource.category || "Curated read";
    const href = resource.url;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
      >
        <div className="h-1 w-full shrink-0" style={{ background: accent }} />
        <div className="p-5 flex flex-col flex-1">
          <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: accent }}>
            RESEARCH OF THE WEEK
          </div>
          <div className="text-lg font-extrabold text-shadow leading-snug mb-0.5">{title}</div>
          <div className="text-[11px] text-muted mb-2">{byline}</div>
          <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4 flex-1">
            {resource.description || "Deep dive worth your attention this week."}
          </p>
          <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed mt-auto" style={{ background: `${accent}14` }}>
            <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: accent }}>
              WHY IT MATTERS
            </div>
            <p className="text-shadow line-clamp-3">
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
        className="bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
      >
        <div className="h-1 w-full shrink-0" style={{ background: accent }} />
        <div className="p-5 flex flex-col flex-1">
          <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: accent }}>
            RESEARCH OF THE WEEK
          </div>
          <div className="text-lg font-extrabold text-shadow leading-snug mb-0.5">{tool.name}</div>
          <div className="text-[11px] text-muted mb-2">{tool.company || tool.category}</div>
          <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4 flex-1">
            {tool.description || tool.best_for || "Tool pick for research-style workflows."}
          </p>
          <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed mt-auto" style={{ background: `${accent}14` }}>
            <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: accent }}>
              WHY IT MATTERS
            </div>
            <p className="text-shadow line-clamp-3">{tool.best_for || tool.description || "Explore capabilities on the vendor site."}</p>
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
