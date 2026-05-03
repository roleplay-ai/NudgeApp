"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, ExternalLink, Play } from "lucide-react";
import type { NewsItem, WatchVideo } from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";

const VIDEO_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];

export default function TodayTabs({ news, videos }: { news: NewsItem[]; videos: WatchVideo[] }) {
  const [view, setView] = useState<"all" | "videos" | "news">("all");

  return (
    <>
      <div className="flex gap-2 mb-5">
        {[
          { id: "all", label: "All" },
          { id: "videos", label: "Videos" },
          { id: "news", label: "News" },
        ].map((it) => (
          <button
            key={it.id}
            onClick={() => setView(it.id as "all" | "videos" | "news")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition
              ${view === it.id ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder hover:border-shadow"}`}
          >
            {it.label}
          </button>
        ))}
      </div>

      {view === "all" && <AllFeed news={news} videos={videos} />}
      {view === "videos" && <VideosGrid videos={videos} />}
      {view === "news" && <NewsList news={news} />}
    </>
  );
}

/* ─── All feed: grouped by date ─── */

type FeedGroup = {
  label: string;
  dateKey: string;
  videos: WatchVideo[];
  news: NewsItem[];
};

function buildGroups(news: NewsItem[], videos: WatchVideo[]): FeedGroup[] {
  const map = new Map<string, FeedGroup>();

  const addVideo = (v: WatchVideo) => {
    const key = toDateKey(v.published_at);
    if (!map.has(key)) map.set(key, { label: dateLabel(v.published_at), dateKey: key, videos: [], news: [] });
    map.get(key)!.videos.push(v);
  };
  const addNews = (n: NewsItem) => {
    const key = toDateKey(n.published_at);
    if (!map.has(key)) map.set(key, { label: dateLabel(n.published_at), dateKey: key, videos: [], news: [] });
    map.get(key)!.news.push(n);
  };

  videos.forEach(addVideo);
  news.forEach(addNews);

  return Array.from(map.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function AllFeed({ news, videos }: { news: NewsItem[]; videos: WatchVideo[] }) {
  const groups = buildGroups(news, videos);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (groups.length === 0) return <div className="text-muted text-sm">Nothing yet.</div>;

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const isCollapsed = collapsed.has(g.dateKey);
        const total = g.videos.length + g.news.length;
        return (
          <div key={g.dateKey}>
            <button
              onClick={() => toggle(g.dateKey)}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-shadow">{g.label}</span>
                <span className="bg-chiffon text-shadow text-[11px] font-bold px-2 py-0.5 rounded-full">{total}</span>
              </div>
              {isCollapsed ? <ChevronDown size={16} className="text-muted" /> : <ChevronUp size={16} className="text-muted" />}
            </button>

            {!isCollapsed && (
              <div className="space-y-4">
                {g.videos.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wider text-muted mb-2">VIDEOS</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {g.videos.map((v, i) => (
                        <VideoCard key={v.id} video={v} colorIndex={i} />
                      ))}
                    </div>
                  </div>
                )}
                {g.news.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold tracking-wider text-muted mb-2">NEWS</div>
                    <div className="space-y-2">
                      {g.news.map((n) => <NewsCard key={n.id} item={n} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Videos grid ─── */

function VideosGrid({ videos }: { videos: WatchVideo[] }) {
  if (videos.length === 0) return <div className="text-muted text-sm">No videos yet.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {videos.map((v, i) => <VideoCard key={v.id} video={v} colorIndex={i} />)}
    </div>
  );
}

/* ─── News list ─── */

function NewsList({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return <div className="text-muted text-sm">No news yet.</div>;
  return (
    <div className="space-y-3">
      {news.map((n) => <NewsCard key={n.id} item={n} />)}
    </div>
  );
}

/* ─── Video card (vertical) ─── */

function VideoCard({ video: v, colorIndex }: { video: WatchVideo; colorIndex: number }) {
  const fallbackColor = VIDEO_COLORS[colorIndex % VIDEO_COLORS.length];
  const thumb = resolveVideoThumbnailUrl(v.thumbnail_url, v.url);
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition block"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video">
        {thumb ? (
          <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: fallbackColor }}>
            <Play size={28} className="text-white" fill="white" />
          </div>
        )}
        {v.duration && (
          <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/75 text-white px-1.5 py-0.5 rounded font-semibold">
            {v.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-[13px] font-bold text-shadow leading-tight mb-1 line-clamp-2">{v.title}</div>
        {v.description && (
          <div className="text-[11px] text-muted leading-snug line-clamp-2 mb-2">{v.description}</div>
        )}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold flex-shrink-0"
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

/* ─── News card ─── */

function NewsCard({ item: n }: { item: NewsItem }) {
  return (
    <a
      href={n.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border-l-4"
      style={{ borderLeftColor: n.tag_color || "#623CEA" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: n.tag_color || "#623CEA" }}
        >
          {n.tag}
        </span>
        <span className="text-[11px] text-muted">{timeAgo(n.published_at)}</span>
        <ExternalLink size={11} className="ml-auto text-muted" />
      </div>
      <div className="text-sm font-bold text-shadow leading-tight mb-1">{n.title}</div>
      {n.body && <div className="text-xs text-muted leading-relaxed">{n.body}</div>}
    </a>
  );
}

/* ─── Helpers ─── */

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
