"use client";
import { useCallback, useRef } from "react";
import { Film } from "lucide-react";
import type { ApplyVideo } from "@/lib/types";

export default function ApplyVideosFeed({ videos }: { videos: ApplyVideo[] }) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

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

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {videos.map((v) => (
        <article
          key={v.id}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-nborder/80 flex flex-col min-w-0"
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
            {v.duration ? (
              <p className="text-[10px] font-bold text-norange">{v.duration}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
