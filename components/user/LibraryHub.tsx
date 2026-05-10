"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import type { NewsItem, Resource, WatchVideo } from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";

function getFaviconUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return null;
  }
}

function ResourceLogo({
  url,
  thumbnailUrl,
  fallbackLetter,
  fallbackBg,
  imgClass,
  tileClass,
}: {
  url: string;
  thumbnailUrl: string | null;
  fallbackLetter: string;
  fallbackBg: string;
  imgClass: string;
  tileClass: string;
}) {
  const [failed, setFailed] = useState(false);
  const logoSrc = !failed ? (thumbnailUrl || getFaviconUrl(url)) : null;

  return (
    <div className={tileClass}>
      {logoSrc ? (
        <img
          src={logoSrc}
          alt=""
          className={imgClass}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="w-full h-full flex items-center justify-center text-white font-black rounded-[inherit]"
          style={{ background: fallbackBg }}
        >
          {fallbackLetter}
        </span>
      )}
    </div>
  );
}

const VIDEO_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];
const ACCENT = {
  videos: "#ED4551",
  articles: "#623CEA",
  news: "#F68A29",
  resources: "#23CE68",
} as const;

type Filter = "videos" | "articles" | "news" | "resources";

function resourceTitle(r: Resource & { name?: string }) {
  return r.title || (r as { name?: string }).name || "Untitled";
}

// ─── Video subcategory definitions ───────────────────────────────────────────

type VideoSubcategory = "gemini" | "chatgpt" | "claude" | "copilot" | "ai_foundations" | "useful";

const SUBCATEGORIES: { id: VideoSubcategory; label: string; color: string }[] = [
  { id: "gemini",         label: "Gemini",         color: "#4285F4" },
  { id: "chatgpt",        label: "ChatGPT",         color: "#10A37F" },
  { id: "claude",         label: "Claude",          color: "#E8865A" },
  { id: "copilot",        label: "Copilot",         color: "#6264A7" },
  { id: "ai_foundations", label: "AI Foundations",  color: "#F68A29" },
  { id: "useful",         label: "Useful",          color: "#623CEA" },
];

function normalizeSubcategory(sub: string | null | undefined): VideoSubcategory {
  const s = (sub || "").trim().toLowerCase();
  if (s === "gemini")         return "gemini";
  if (s === "chatgpt")        return "chatgpt";
  if (s === "claude")         return "claude";
  if (s === "copilot")        return "copilot";
  if (s === "ai_foundations") return "ai_foundations";
  return "useful";
}

// ─── Auto-scroll carousel hook ────────────────────────────────────────────────

function useCarousel(count: number, intervalMs = 4500) {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const scrollPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSyncSuppressedUntilRef = useRef(0);
  const idxChangeSourceRef = useRef<"external" | "scroll">("external");

  const suppressScrollSync = useCallback((ms = 700) => {
    scrollSyncSuppressedUntilRef.current = Date.now() + ms;
  }, []);

  function scrollTrackToCard(track: HTMLDivElement, index: number, behavior: ScrollBehavior) {
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const target = Math.max(0, card.offsetLeft - padLeft);
    track.scrollTo({ left: target, behavior });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;
    if (idxChangeSourceRef.current === "scroll") {
      idxChangeSourceRef.current = "external";
      return;
    }
    suppressScrollSync(750);
    requestAnimationFrame(() => {
      scrollTrackToCard(track, activeIdx, "smooth");
    });
  }, [activeIdx, count, suppressScrollSync]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        idxChangeSourceRef.current = "external";
        suppressScrollSync(750);
        setActiveIdx((p) => (p + 1) % count);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs, suppressScrollSync]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;
    let raf = 0;
    const onScroll = () => {
      pausedRef.current = true;
      if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
      scrollPauseTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, 3800);
      if (Date.now() < scrollSyncSuppressedUntilRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = [...track.children] as HTMLElement[];
        if (!children.length) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        children.forEach((el, i) => {
          const mid = el.offsetLeft + el.offsetWidth / 2;
          const d = Math.abs(mid - center);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        idxChangeSourceRef.current = "scroll";
        setActiveIdx(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
      track.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => { pausedRef.current = false; }, []);
  const pauseFor = useCallback((ms: number) => {
    pausedRef.current = true;
    setTimeout(() => { pausedRef.current = false; }, ms);
  }, []);

  const step = useCallback((delta: number) => {
    idxChangeSourceRef.current = "external";
    suppressScrollSync(750);
    setActiveIdx((p) => Math.max(0, Math.min(count - 1, p + delta)));
    pausedRef.current = true;
    setTimeout(() => { pausedRef.current = false; }, 4500);
  }, [count, suppressScrollSync]);

  return { activeIdx, trackRef, pause, resume, pauseFor, step };
}

function useCarouselInteractionHint(): "swipe" | "drag" {
  const [hint, setHint] = useState<"swipe" | "drag">("swipe");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setHint(mq.matches ? "drag" : "swipe");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return hint;
}

// ─── Video carousel card ─────────────────────────────────────────────────────

function VideoCarouselCard({
  video: v,
  accent,
  isActive,
}: {
  video: WatchVideo;
  accent: string;
  isActive: boolean;
}) {
  const thumb = resolveVideoThumbnailUrl(v.thumbnail_url, v.url);
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex-shrink-0 w-[min(268px,calc(100vw-3rem))] overflow-hidden rounded-[18px] border border-black/[0.06] bg-white text-left transition-opacity duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] snap-start flex flex-col ${
        isActive ? "opacity-100" : "opacity-[0.9] hover:opacity-100"
      }`}
    >
      <div
        className="relative h-[148px] w-full shrink-0 overflow-hidden"
        style={{
          background: thumb
            ? undefined
            : `linear-gradient(155deg, ${accent} 0%, #1a1030 48%, #0f0a18 100%)`,
        }}
      >
        {thumb ? (
          <>
            <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" aria-hidden />
          </>
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
            <span className="text-shadow text-[18px] leading-none pl-1" aria-hidden>▶</span>
          </div>
        </div>
        {v.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-px font-mono text-[11px] font-medium text-white tabular-nums">
            {v.duration}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 pt-3 pb-3.5 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: accent }} aria-hidden />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted truncate">
            {v.creator}
          </span>
        </div>
        <div className="text-[15px] font-bold text-shadow leading-snug line-clamp-2">{v.title}</div>
        {v.description && (
          <p className="text-[12px] text-muted leading-relaxed line-clamp-2">{v.description}</p>
        )}
      </div>
    </a>
  );
}

// ─── Per-subcategory carousel ─────────────────────────────────────────────────

function VideoSubcategoryCarousel({
  subcategory,
  videos,
}: {
  subcategory: { id: VideoSubcategory; label: string; color: string };
  videos: WatchVideo[];
}) {
  const hint = useCarouselInteractionHint();
  const { activeIdx, trackRef, pause, resume, pauseFor, step } = useCarousel(videos.length);

  const arrowBtn =
    "absolute top-[74px] z-[2] hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white text-shadow shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-black/[0.06] hover:bg-[#fafafa] transition-colors";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span
          className="w-1 h-5 rounded-full flex-shrink-0"
          style={{ background: subcategory.color }}
          aria-hidden
        />
        <h3
          className="text-[13px] font-extrabold tracking-wide uppercase"
          style={{ color: subcategory.color }}
        >
          {subcategory.label}
        </h3>
        <span className="text-[10px] font-semibold text-muted">
          {videos.length} {videos.length === 1 ? "video" : "videos"}
        </span>
      </div>

      <div
        className="relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={() => pauseFor(4000)}
      >
        {videos.length > 1 && (
          <>
            <button
              type="button"
              className={`${arrowBtn} left-0 -translate-x-1`}
              aria-label={`Previous ${subcategory.label} video`}
              onClick={() => step(-1)}
            >
              <ChevronLeft size={20} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              className={`${arrowBtn} right-0 translate-x-1`}
              aria-label={`Next ${subcategory.label} video`}
              onClick={() => step(1)}
            >
              <ChevronRight size={20} strokeWidth={2.25} />
            </button>
          </>
        )}

        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto pb-1 scroll-pl-4 scroll-pr-4 pl-4 pr-4 md:scroll-pl-0 md:scroll-pr-0 md:pl-0 md:pr-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {videos.map((v, i) => (
            <VideoCarouselCard
              key={v.id}
              video={v}
              accent={subcategory.color}
              isActive={i === activeIdx}
            />
          ))}
        </div>

        <div className="flex items-center mt-3 px-0">
          <div
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold tabular-nums bg-[#1A1A1A] text-white/90 shadow-sm"
            aria-live="polite"
          >
            <span style={{ color: subcategory.color }}>{String(activeIdx + 1).padStart(2, "0")}</span>
            <span className="text-white/75">{` / ${String(videos.length).padStart(2, "0")}`}</span>
            <span className="text-white/35 px-0.5">·</span>
            <span className="text-white/80 font-medium">{hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── All subcategory carousels for a video list ────────────────────────────────

function VideosByCategorySection({ videos }: { videos: WatchVideo[] }) {
  const grouped = useMemo(() => {
    const map = new Map<VideoSubcategory, WatchVideo[]>();
    for (const sub of SUBCATEGORIES) map.set(sub.id, []);
    for (const v of videos) {
      const cat = normalizeSubcategory(v.subcategory);
      map.get(cat)!.push(v);
    }
    return map;
  }, [videos]);

  const activeSubs = SUBCATEGORIES.filter((sub) => (grouped.get(sub.id)?.length ?? 0) > 0);

  if (!activeSubs.length) {
    return <p className="text-sm text-muted">No videos yet.</p>;
  }

  return (
    <div className="space-y-10">
      {activeSubs.map((sub) => (
        <VideoSubcategoryCarousel
          key={sub.id}
          subcategory={sub}
          videos={grouped.get(sub.id)!}
        />
      ))}
    </div>
  );
}

// ─── Main LibraryHub ──────────────────────────────────────────────────────────

export default function LibraryHub({
  news,
  videos,
  resources,
}: {
  news: NewsItem[];
  videos: WatchVideo[];
  resources: Resource[];
}) {
  const articles = useMemo(
    () => resources.filter((r) => (r.resource_type || "").toLowerCase() === "article"),
    [resources],
  );
  const learningResources = useMemo(
    () => resources.filter((r) => (r.resource_type || "").toLowerCase() !== "article"),
    [resources],
  );

  const [filter, setFilter] = useState<Filter>("videos");
  const [q, setQ] = useState("");

  const matches = (text: string | null | undefined) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (text || "").toLowerCase().includes(s);
  };

  const fNews = news.filter((n) => matches(n.title) || matches(n.body) || matches(n.tag));
  const fVideos = videos.filter((v) => matches(v.title) || matches(v.description) || matches(v.creator));
  const fArticles = articles.filter(
    (r) => matches(resourceTitle(r)) || matches(r.description) || matches(r.author) || matches(r.category),
  );
  const fResources = learningResources.filter(
    (r) => matches(resourceTitle(r)) || matches(r.description) || matches(r.author) || matches(r.resource_type),
  );

  return (
    <>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search videos, articles, news..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm bg-white border border-nborder shadow-sm
            focus:outline-none focus:ring-2 focus:ring-shadow/15 focus:border-shadow"
          aria-label="Search insights"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {(
          [
            ["videos", "Videos"],
            ["articles", "Articles"],
            ["news", "News"],
            ["resources", "Resources"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition
              ${filter === id ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder hover:border-shadow"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === "videos" && (
        <section>
          <SectionTitle dotColor={ACCENT.videos} label="Videos" count={fVideos.length} isVideos />
          {fVideos.length === 0 ? (
            <p className="text-sm text-muted">No videos yet.</p>
          ) : (
            <VideosByCategorySection videos={fVideos} />
          )}
        </section>
      )}

      {filter === "articles" && (
        <section>
          <SectionTitle dotColor={ACCENT.articles} label="Articles & reads" count={fArticles.length} />
          {fArticles.length === 0 ? (
            <p className="text-sm text-muted">No articles yet.</p>
          ) : (
            <div className="space-y-2.5">
              {fArticles.map((r, i) => (
                <ArticleRow key={r.id} resource={r} colorIndex={i} />
              ))}
            </div>
          )}
        </section>
      )}

      {filter === "news" && (
        <section>
          <SectionTitle dotColor={ACCENT.news} label="News" count={fNews.length} />
          {fNews.length === 0 ? (
            <p className="text-sm text-muted">No news yet.</p>
          ) : (
            <NewsBuckets items={fNews} />
          )}
        </section>
      )}

      {filter === "resources" && (
        <section>
          <SectionTitle dotColor={ACCENT.resources} label="Learning resources" count={fResources.length} />
          {fResources.length === 0 ? (
            <p className="text-sm text-muted">No resources yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fResources.map((r, i) => (
                <ResourceTile key={r.id} resource={r} colorIndex={i} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}


function SectionTitle({ dotColor, label, count, isVideos = false }: { dotColor: string; label: string; count: number; isVideos?: boolean }) {
  if (isVideos) {
    return (
      <div className="mb-6">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-1" style={{ color: dotColor }}>
          INSIGHTS
        </p>
        <div className="flex items-end gap-3">
          <h2 className="text-2xl font-extrabold text-shadow leading-tight">{label}</h2>
          <span className="text-[11px] font-bold text-muted mb-0.5">{count} total</span>
        </div>
        <div className="mt-3 h-px bg-nborder" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} aria-hidden />
      <h2 className="text-base font-extrabold text-shadow">{label}</h2>
      <span className="text-[11px] font-bold text-muted bg-white px-2 py-0.5 rounded-full border border-nborder">
        {count} items
      </span>
    </div>
  );
}

function NewsBuckets({ items }: { items: NewsItem[] }) {
  const buckets = bucketNews(items);
  return (
    <div className="space-y-8">
      {buckets.map((b) => (
        <div key={b.label}>
          <div className="text-[10px] font-bold tracking-[0.2em] text-muted mb-3">{b.label}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {b.items.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function bucketNews(news: NewsItem[]): { label: string; items: NewsItem[] }[] {
  const sorted = [...news].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  const now = Date.now();
  const day = 86_400_000;
  const thisWeek: NewsItem[] = [];
  const lastWeek: NewsItem[] = [];
  const older: NewsItem[] = [];
  for (const n of sorted) {
    const age = now - new Date(n.published_at).getTime();
    if (age <= 7 * day) thisWeek.push(n);
    else if (age <= 14 * day) lastWeek.push(n);
    else older.push(n);
  }
  const out: { label: string; items: NewsItem[] }[] = [];
  if (thisWeek.length) out.push({ label: "THIS WEEK", items: thisWeek });
  if (lastWeek.length) out.push({ label: "LAST WEEK", items: lastWeek });
  if (older.length) out.push({ label: "OLDER", items: older });
  return out;
}

function NewsCard({ item: n }: { item: NewsItem }) {
  return (
    <a
      href={n.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl p-4 border border-nborder shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide"
          style={{ background: n.tag_color || "#623CEA" }}
        >
          {n.tag}
        </span>
        <span className="text-[11px] text-muted">{timeAgo(n.published_at)}</span>
        <ExternalLink size={12} className="ml-auto text-muted" />
      </div>
      <div className="text-sm font-bold text-shadow leading-tight mb-1.5">{n.title}</div>
      {n.body && <div className="text-xs text-muted leading-relaxed line-clamp-3">{n.body}</div>}
    </a>
  );
}

function ArticleRow({ resource: r, colorIndex }: { resource: Resource; colorIndex: number }) {
  const title = resourceTitle(r);
  const color = VIDEO_COLORS[colorIndex % VIDEO_COLORS.length];
  const pill = (r.category || r.resource_type || "article").toUpperCase();
  const readLabel = r.duration_mins != null ? `${r.duration_mins} min read` : "Read";

  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 items-center bg-white rounded-2xl p-4 border border-nborder shadow-sm hover:shadow-md transition"
    >
      <ResourceLogo
        url={r.url}
        thumbnailUrl={r.thumbnail_url}
        fallbackLetter={title[0]?.toUpperCase() ?? "?"}
        fallbackBg={color}
        imgClass="w-7 h-7 object-contain"
        tileClass="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-nborder overflow-hidden"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white tracking-wide"
            style={{ background: color }}
          >
            {pill}
          </span>
          {r.author && <span className="text-[11px] text-muted font-medium">{r.author}</span>}
          <span className="text-[11px] text-muted">· {readLabel}</span>
        </div>
        <div className="text-sm font-bold text-shadow leading-tight mb-0.5">{title}</div>
        {r.description && <div className="text-xs text-muted line-clamp-2">{r.description}</div>}
      </div>
      <span className="text-xs font-bold flex items-center gap-1 flex-shrink-0" style={{ color }}>
        Read <ExternalLink size={12} />
      </span>
    </a>
  );
}

function ResourceTile({ resource: r, colorIndex }: { resource: Resource; colorIndex: number }) {
  const title = resourceTitle(r);
  const color = VIDEO_COLORS[colorIndex % VIDEO_COLORS.length];
  const type = (r.resource_type || "resource").toLowerCase();

  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col bg-white rounded-2xl p-4 border border-nborder shadow-sm hover:shadow-md transition h-full"
    >
      <div className="flex gap-3 mb-3">
        <ResourceLogo
          url={r.url}
          thumbnailUrl={r.thumbnail_url}
          fallbackLetter={title[0]?.toUpperCase() ?? "?"}
          fallbackBg={color}
          imgClass="w-6 h-6 object-contain"
          tileClass="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-nborder overflow-hidden"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-shadow leading-tight">{title}</span>
            {r.is_featured && (
              <span className="text-[9px] font-bold bg-chiffon text-shadow px-2 py-0.5 rounded-full">Featured</span>
            )}
          </div>
          {r.author && <div className="text-[11px] text-muted mt-0.5">{r.author}</div>}
        </div>
      </div>
      {r.description && <p className="text-[12px] text-muted leading-snug line-clamp-3 flex-1 mb-3">{r.description}</p>}
      <div className="mt-auto flex items-center justify-between text-[11px]">
        <span className="text-muted capitalize">{type}</span>
        <span className="font-bold inline-flex items-center gap-1" style={{ color }}>
          Open <ExternalLink size={11} />
        </span>
      </div>
    </a>
  );
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}
