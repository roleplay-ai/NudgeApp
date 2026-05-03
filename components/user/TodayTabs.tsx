"use client";
import { useState } from "react";
import { ExternalLink, Play, Search } from "lucide-react";
import type { NewsItem, WatchVideo } from "@/lib/types";

const VIDEO_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];

export default function TodayTabs({ news, videos }: { news: NewsItem[]; videos: WatchVideo[] }) {
  const [view, setView] = useState<"today" | "watch" | "archive">("today");
  const [search, setSearch] = useState("");

  const filteredArchive = news.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4 max-w-md">
        {[
          { id: "today", label: "News" },
          { id: "watch", label: "Watch" },
          { id: "archive", label: "Archive" },
        ].map((it) => (
          <button key={it.id} onClick={() => setView(it.id as any)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition
              ${view === it.id ? "bg-shadow text-amber" : "text-muted hover:text-shadow"}`}>
            {it.label}
          </button>
        ))}
      </div>

      {view === "today" && (
        <div className="space-y-3">
          {news.map((n) => (
            <a key={n.id} href={n.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border-l-4"
              style={{ borderLeftColor: n.tag_color || "#623CEA" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: n.tag_color || "#623CEA" }}>
                  {n.tag}
                </span>
                <span className="text-[11px] text-muted">{timeAgo(n.published_at)}</span>
                <ExternalLink size={11} className="ml-auto text-muted" />
              </div>
              <div className="text-sm font-bold text-shadow leading-tight mb-1">{n.title}</div>
              <div className="text-xs text-muted leading-relaxed">{n.body}</div>
            </a>
          ))}
          {news.length === 0 && <div className="text-muted text-sm">No news yet.</div>}
        </div>
      )}

      {view === "watch" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {videos.map((v, i) => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition flex gap-3">
              <div className="w-24 h-16 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{ background: VIDEO_COLORS[i % VIDEO_COLORS.length] }}>
                <Play size={22} className="text-white" fill="white" />
                {v.duration && (
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-semibold">
                    {v.duration}
                  </span>
                )}
              </div>
              <div className="flex-1 py-1">
                <div className="text-[13px] font-bold text-shadow leading-tight mb-1">{v.title}</div>
                <div className="text-[11px] text-muted">{v.creator}</div>
                {v.description && (
                  <div className="text-[10px] text-muted mt-1 line-clamp-1">{v.description}</div>
                )}
              </div>
            </a>
          ))}
          {videos.length === 0 && <div className="text-muted text-sm">No videos yet.</div>}
        </div>
      )}

      {view === "archive" && (
        <div>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-3.5 text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search archive…"
              className="w-full pl-10 pr-4 py-3 bg-chiffon border-0 rounded-xl text-sm" />
          </div>
          <div className="text-[11px] text-muted font-semibold mb-2">{filteredArchive.length} items</div>
          <div className="space-y-2">
            {filteredArchive.map((it) => (
              <a key={it.id} href={it.url || "#"} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: it.tag_color || "#623CEA" }} />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-shadow leading-tight">{it.title}</div>
                  <div className="text-[10px] text-muted mt-0.5">{timeAgo(it.published_at)} · {it.tag}</div>
                </div>
                <ExternalLink size={14} className="text-muted" />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
