"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Film, X } from "lucide-react";
import type { ApplyVideo } from "@/lib/types";

const ACCENTS = ["#A855F7", "#EC4899", "#F59E0B", "#3B82F6", "#23CE68", "#ED4551"];
const DOT_FALLBACK = ["#FFCE00", "#23CE68"];
const GROUP_ORDER = ["Features", "Apps", "Workflows", "Skills"] as const;

/** First paragraph of description (tagline) for compact cards; modal still uses full description. */
function walkthroughCaption(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  const head = description.split(/\n\n+/)[0]?.trim();
  if (!head) return null;
  const oneLine = head.replace(/\s+/g, " ").trim();
  return oneLine.length > 0 ? oneLine : null;
}

function stripVideoSeedFooter(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  return description.replace(/\n*\[seed:ai-features-guide-v1]\s*$/i, "").trim() || null;
}

export default function ApplyVideosFeed({
  videos,
  variant = "light",
}: {
  videos: ApplyVideo[];
  variant?: "light" | "dark";
}) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [modalVideo, setModalVideo] = useState<ApplyVideo | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>("All");

  const registerRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  }, []);

  const pauseOthers = useCallback((playingId: string) => {
    videoRefs.current.forEach((el, id) => {
      if (id !== playingId) el.pause();
    });
  }, []);

  const filteredDarkVideos = useMemo(() => {
    if (variant !== "dark") return videos;
    if (groupFilter === "All") return videos;
    return videos.filter((v) => (v.group_name || "Features") === groupFilter);
  }, [videos, groupFilter, variant]);

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-nborder bg-white p-8 text-center">
        <Film size={32} className="text-muted mx-auto mb-3" />
        <p className="font-semibold text-shadow text-sm mb-2">No published videos yet</p>
        <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
          This page reads from <code className="text-xs bg-chiffon px-1 rounded">apply_videos</code> where{" "}
          <strong className="text-shadow">is_published</strong> is true. Add clips in{" "}
          <strong className="text-shadow">Admin → Apply videos</strong>, or run your SQL seeds, then publish the rows you
          want visible.
        </p>
      </div>
    );
  }

  if (variant === "dark") {
    const chips = ["All", ...GROUP_ORDER];

    return (
      <>
        <div className="flex gap-2 flex-wrap mb-3">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setGroupFilter(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition
                ${groupFilter === c ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder hover:border-shadow"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-bold text-muted mb-4">{filteredDarkVideos.length} items</p>
        {filteredDarkVideos.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No cards in this category. Try &quot;All&quot; or pick another filter.</p>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredDarkVideos.map((v, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const letter = (v.title || "V").replace(/[^A-Za-z]/g, "").slice(0, 1) || "V";
            const caption = walkthroughCaption(v.description);
            const dots = [accent, DOT_FALLBACK[0], DOT_FALLBACK[1]];
            const tag = (v.category_tag || "").trim();
            const dur = (v.duration || "").trim();
            const pillRaw = tag || dur || "Guide";
            const pill = tag ? tag.toUpperCase() : /\d/.test(pillRaw) ? pillRaw : pillRaw.toUpperCase();
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setModalVideo(v)}
                className="relative text-left rounded-2xl overflow-hidden border border-white/10 min-h-[158px] p-4 pt-5 flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] cursor-pointer hover:border-amber/40 transition w-full text-white"
                style={{ backgroundColor: "#121212" }}
              >
                <div
                  className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full opacity-45 blur-2xl"
                  style={{ background: accent }}
                />
                <div className="relative flex justify-start items-start mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0"
                    style={{ background: accent }}
                  >
                    {letter.toUpperCase()}
                  </div>
                </div>
                <div className="relative font-extrabold text-amber text-[14px] leading-snug mb-1 line-clamp-2 tracking-tight">
                  {v.title}
                </div>
                {caption ? (
                  <p className="relative text-[12px] text-white/88 leading-snug line-clamp-2 mb-4 min-h-[2.5rem]">{caption}</p>
                ) : (
                  <div className="mb-4 min-h-[2.5rem]" />
                )}
                <div className="relative flex items-end justify-between gap-2 mt-auto pt-1">
                  <span
                    className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-black/30 max-w-[70%] truncate"
                    style={{ borderColor: `${accent}88`, color: accent }}
                  >
                    {pill}
                  </span>
                  <span className="flex gap-0.5 shrink-0">
                    {dots.map((c, j) => (
                      <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    ))}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        )}

        {modalVideo && (
          <div
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/55 backdrop-blur-sm"
            onClick={() => setModalVideo(null)}
          >
            <div
              className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-nborder"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-nborder shrink-0">
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-shadow leading-tight">{modalVideo.title}</h2>
                  {stripVideoSeedFooter(modalVideo.description) ? (
                    <p className="text-sm text-muted mt-1 leading-snug whitespace-pre-wrap">
                      {stripVideoSeedFooter(modalVideo.description)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setModalVideo(null)}
                  className="rounded-full p-2 text-muted hover:bg-chiffon hover:text-shadow shrink-0"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="bg-black aspect-video w-full shrink-0">
                <video
                  key={modalVideo.id}
                  src={modalVideo.video_url}
                  controls
                  controlsList="nodownload"
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                  poster={modalVideo.thumbnail_url ?? undefined}
                >
                  Your browser does not support embedded video.
                </video>
              </div>
              <div className="flex justify-end gap-2 px-5 py-4 border-t border-nborder bg-bg/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalVideo(null)}
                  className="px-5 py-2.5 rounded-full border border-nborder text-sm font-semibold text-shadow hover:bg-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {videos.map((v) => (
        <article
          key={v.id}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-nborder flex flex-col min-w-0"
        >
          <div className="relative w-full bg-black aspect-video">
            <video
              ref={(el) => registerRef(v.id, el)}
              src={v.video_url}
              controls
              controlsList="nodownload"
              playsInline
              preload="metadata"
              poster={v.thumbnail_url ?? undefined}
              className="absolute inset-0 h-full w-full object-contain"
              onPlay={() => pauseOthers(v.id)}
            >
              Your browser does not support embedded video.
            </video>
          </div>
          <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col min-w-0">
            <h2 className="font-bold text-sm text-shadow leading-snug line-clamp-2">{v.title}</h2>
            {v.description ? (
              <p className="text-xs text-muted leading-relaxed line-clamp-4 flex-1">{v.description}</p>
            ) : null}
            {v.duration ? <p className="text-[10px] font-bold text-norange">{v.duration}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
