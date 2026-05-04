"use client";

import { useCallback, useRef, useState } from "react";
import { Film, Play, X } from "lucide-react";
import type { ApplyVideo } from "@/lib/types";

const ACCENTS = ["#A855F7", "#EC4899", "#F59E0B", "#3B82F6", "#23CE68", "#ED4551"];

export default function ApplyVideosFeed({
  videos,
  variant = "light",
}: {
  videos: ApplyVideo[];
  variant?: "light" | "dark";
}) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [modalVideo, setModalVideo] = useState<ApplyVideo | null>(null);

  const registerRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  }, []);

  const pauseOthers = useCallback((playingId: string) => {
    videoRefs.current.forEach((el, id) => {
      if (id !== playingId) el.pause();
    });
  }, []);

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <Film size={32} className="text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">Walkthrough videos will appear here when they are published.</p>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {videos.map((v, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const letter = (v.title || "V").replace(/[^A-Za-z]/g, "").slice(0, 1) || "V";
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setModalVideo(v)}
                className="relative text-left rounded-2xl overflow-hidden border border-white/10 min-h-[180px] flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] cursor-pointer hover:border-amber/35 transition w-full"
                style={{ backgroundColor: "#121212" }}
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl"
                  style={{ background: accent }}
                />
                <div className="relative flex justify-start items-start gap-2 px-4 pt-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ background: accent }}
                  >
                    {letter}
                  </div>
                </div>
                <div className="relative px-4 pb-2">
                  <h2 className="font-extrabold text-sm text-amber leading-snug line-clamp-2 mb-1">{v.title}</h2>
                  {v.description ? (
                    <p className="text-[11px] text-white/80 leading-relaxed line-clamp-2">{v.description}</p>
                  ) : null}
                </div>
                <div className="relative flex-1 min-h-[120px] mt-auto bg-black">
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-black to-zinc-900" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                      <Play size={26} className="text-shadow ml-1" fill="currentColor" />
                    </span>
                  </div>
                  {v.duration ? (
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/75 text-white px-1.5 py-0.5 rounded">
                      {v.duration}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

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
                  {modalVideo.description ? (
                    <p className="text-sm text-muted mt-1 leading-snug">{modalVideo.description}</p>
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
