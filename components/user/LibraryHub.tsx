"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Play, Search } from "lucide-react";
import type { NewsItem, Resource, WatchVideo } from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";

const VIDEO_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];
const ACCENT = {
  videos: "#ED4551",
  articles: "#623CEA",
  news: "#F68A29",
  resources: "#23CE68",
} as const;

type Filter = "all" | "videos" | "articles" | "news" | "resources";

function resourceTitle(r: Resource & { name?: string }) {
  return r.title || (r as { name?: string }).name || "Untitled";
}

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

  const [filter, setFilter] = useState<Filter>("all");
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
          aria-label="Search library"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {(
          [
            ["all", "All"],
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

      {filter === "all" && (
        <div className="space-y-10">
          {fVideos.length > 0 && (
            <section>
              <SectionTitle dotColor={ACCENT.videos} label="Videos" count={fVideos.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fVideos.map((v, i) => (
                  <VideoCard key={v.id} video={v} colorIndex={i} />
                ))}
              </div>
            </section>
          )}
          {fArticles.length > 0 && (
            <section>
              <SectionTitle dotColor={ACCENT.articles} label="Articles & reads" count={fArticles.length} />
              <div className="space-y-2.5">
                {fArticles.map((r, i) => (
                  <ArticleRow key={r.id} resource={r} colorIndex={i} />
                ))}
              </div>
            </section>
          )}
          {fNews.length > 0 && (
            <section>
              <SectionTitle dotColor={ACCENT.news} label="News" count={fNews.length} />
              <NewsBuckets items={fNews} />
            </section>
          )}
          {fResources.length > 0 && (
            <section>
              <SectionTitle dotColor={ACCENT.resources} label="Learning resources" count={fResources.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fResources.map((r, i) => (
                  <ResourceTile key={r.id} resource={r} colorIndex={i} />
                ))}
              </div>
            </section>
          )}
          {emptyLibrary(fVideos, fArticles, fNews, fResources) && (
            <p className="text-sm text-muted py-6">
              {q.trim() ? "Nothing matches your search." : "Nothing yet — check back soon."}
            </p>
          )}
        </div>
      )}

      {filter === "videos" && (
        <section>
          <SectionTitle dotColor={ACCENT.videos} label="Videos" count={fVideos.length} />
          {fVideos.length === 0 ? (
            <p className="text-sm text-muted">No videos yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fVideos.map((v, i) => (
                <VideoCard key={v.id} video={v} colorIndex={i} />
              ))}
            </div>
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

function emptyLibrary(v: WatchVideo[], a: Resource[], n: NewsItem[], r: Resource[]) {
  return v.length === 0 && a.length === 0 && n.length === 0 && r.length === 0;
}

function SectionTitle({ dotColor, label, count }: { dotColor: string; label: string; count: number }) {
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

function VideoCard({ video: v, colorIndex }: { video: WatchVideo; colorIndex: number }) {
  const fallbackColor = VIDEO_COLORS[colorIndex % VIDEO_COLORS.length];
  const thumb = resolveVideoThumbnailUrl(v.thumbnail_url, v.url);
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl overflow-hidden border border-nborder shadow-sm hover:shadow-md transition block group"
    >
      <div className="relative w-full aspect-video">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: fallbackColor }}>
            <Play size={32} className="text-white opacity-90" fill="white" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
            <Play size={22} className="text-shadow ml-0.5" fill="currentColor" />
          </div>
        </div>
        <span className="absolute top-2 left-2 text-[9px] font-bold tracking-wide text-white bg-black/60 px-2 py-0.5 rounded-full">
          VIDEO
        </span>
        {v.duration && (
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/75 text-white px-1.5 py-0.5 rounded font-semibold">
            {v.duration}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-[13px] font-bold text-shadow leading-snug mb-1.5 line-clamp-2">{v.title}</div>
        {v.description && (
          <div className="text-[11px] text-muted leading-snug line-clamp-2 mb-3">{v.description}</div>
        )}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
            style={{ background: VIDEO_COLORS[(v.creator.charCodeAt(0) || 0) % VIDEO_COLORS.length] }}
          >
            {v.creator[0]?.toUpperCase()}
          </div>
          <span className="text-[11px] text-muted font-medium truncate">{v.creator}</span>
          <span className="text-[11px] text-muted ml-auto flex-shrink-0">{formatDate(v.published_at)}</span>
        </div>
      </div>
    </a>
  );
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
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
        style={{ background: color }}
      >
        {title[0]?.toUpperCase()}
      </div>
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
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: color }}
        >
          {r.thumbnail_url ? (
            <img src={r.thumbnail_url} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            title[0]?.toUpperCase()
          )}
        </div>
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}
