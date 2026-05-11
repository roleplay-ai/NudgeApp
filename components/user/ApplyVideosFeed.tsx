"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Film, Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ApplyVideo } from "@/lib/types";
import { youtubeEmbedSrc } from "@/lib/youtubeEmbed";
import { awardPointsAction } from "@/app/actions/awardPointsAction";

/** Default XP for an apply_video — must match point_rules seed in migration_026. */
const APPLY_VIDEO_DEFAULT_POINTS = 15;

const ACCENTS = ["#A855F7", "#EC4899", "#F59E0B", "#3B82F6", "#23CE68", "#ED4551"];
const GROUP_ORDER = ["Features", "Apps", "Workflows", "Skills"] as const;

const GROUP_ACCENT: Record<string, string> = {
  Features: "#A855F7",
  Apps: "#EC4899",
  Workflows: "#F59E0B",
  Skills: "#3B82F6",
};

const PLATFORM_COLORS: Record<string, string> = {
  ChatGPT: "#23CE68",
  Claude: "#D97757",
  Gemini: "#4285F4",
  Copilot: "#0078D4",
  "Google AI Studio": "#FBBC04",
  "Copilot Studio": "#0078D4",
  "Codex (OpenAI)": "#10A37F",
  "Claude Code": "#D97757",
  "Comet (Perplexity)": "#8B5CF6",
  "Operator/Atlas (OpenAI)": "#10A37F",
};

function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url.trim());
}

function iconLetter(title: string) {
  return title.replace(/[^A-Za-z]/g, "").slice(0, 1) || "V";
}

function formatCategoryLabel(tag: string | null | undefined): string {
  if (!tag?.trim()) return "";
  const t = tag.trim().toLowerCase();
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripVideoSeedFooter(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  return description.replace(/\n*\[seed:ai-features-guide-v1]\s*$/i, "").trim() || null;
}

/** Split admin "platforms" field: pipe or comma separated. */
function parsePlatformsField(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  if (raw.includes("|")) {
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Tagline + body + platform names from seeded description blocks. */
function parseApplyVideoDescription(description: string | null | undefined) {
  const raw = stripVideoSeedFooter(description);
  if (!raw?.trim()) return { tagline: "", whatBody: "", platformNames: [] as string[] };
  const blocks = raw.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const tagline = blocks[0] || "";
  const platIdx = blocks.findIndex((b) => /^Platforms:/i.test(b));
  const platformNames =
    platIdx >= 0
      ? blocks[platIdx]
          .replace(/^Platforms:\s*/i, "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const bodyBlocks = platIdx >= 0 ? blocks.slice(1, platIdx) : blocks.slice(1);
  const whatBody = bodyBlocks.join("\n\n").trim() || "";
  return { tagline, whatBody, platformNames };
}

/** First paragraph of description (tagline) for compact cards; modal still uses full description. */
function walkthroughCaption(description: string | null | undefined): string | null {
  if (!description?.trim()) return null;
  const head = description.split(/\n\n+/)[0]?.trim();
  if (!head) return null;
  const oneLine = head.replace(/\s+/g, " ").trim();
  return oneLine.length > 0 ? oneLine : null;
}

export function ApplyVideoDetailModal({ video, onClose }: { video: ApplyVideo; onClose: () => void }) {
  const group = (video.group_name || "Features").trim();
  const accent = GROUP_ACCENT[group] || "#A855F7";
  const cat = formatCategoryLabel(video.category_tag);
  const embed = youtubeEmbedSrc(video.video_url);
  const mp4 = !embed && isDirectVideoUrl(video.video_url);
  const { tagline, whatBody, platformNames: platformsFromDescription } = parseApplyVideoDescription(video.description);
  const platformNamesFromColumn = parsePlatformsField(video.platforms);
  const platformNames =
    platformNamesFromColumn.length > 0 ? platformNamesFromColumn : platformsFromDescription;
  const what =
    whatBody.trim() ||
    stripVideoSeedFooter(video.description)?.replace(/^[^\n]+\n\n?/, "").trim() ||
    tagline;

  const router = useRouter();
  const [awarding, setAwarding] = useState(false);

  async function handleGotIt() {
    if (awarding) return;
    setAwarding(true);
    try {
      const result = await awardPointsAction({
        sourceType: "apply_video",
        sourceId: video.id,
        pointsAward: video.points_award,
        defaultPoints: APPLY_VIDEO_DEFAULT_POINTS,
      });
      if (!result.success && result.error !== "Not authenticated") {
        console.error("[ApplyVideoDetailModal] award_points failed:", result.error);
      }
      router.refresh();
    } finally {
      setAwarding(false);
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-sm"
      onClick={awarding ? undefined : onClose}
    >
      <div
        className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-nborder"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-5 pt-5 pb-4 border-b border-nborder shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={awarding}
            className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-chiffon hover:text-shadow disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex gap-3 pr-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0 overflow-hidden shadow-md"
              style={{ background: accent }}
            >
              {iconLetter(video.title).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: accent }}>
                  {group}
                </span>
                {cat ? <span className="text-[12px] font-medium text-muted">{cat}</span> : null}
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-shadow leading-tight">{video.title}</h2>
              {tagline ? <p className="text-sm text-muted mt-0.5">{tagline}</p> : null}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {embed ? (
            <div className="aspect-video bg-[#1a1a1a] w-full">
              <iframe
                title={`Video: ${video.title}`}
                src={embed}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : mp4 ? (
            <div className="aspect-video bg-black w-full">
              <video
                key={video.id}
                src={video.video_url}
                controls
                controlsList="nodownload"
                playsInline
                poster={video.thumbnail_url ?? undefined}
                className="w-full h-full object-contain"
              >
                Your browser does not support embedded video.
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-[#2a2a2a] flex items-center justify-center text-white/50 text-sm px-6 text-center">
              Add a YouTube or video file URL in Admin → Apply videos.
            </div>
          )}

          <div className="px-5 py-5 space-y-6">
            <section>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-norange mb-2">WHAT IT DOES</h3>
              <p className="text-sm text-shadow leading-relaxed whitespace-pre-wrap">{what}</p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-norange mb-3">AVAILABLE IN</h3>
              {platformNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {platformNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-nborder bg-white text-sm font-semibold text-shadow"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: PLATFORM_COLORS[name] || "#6B6B6B" }}
                      />
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Add a &quot;Platforms: …&quot; line in the description to list tools here.</p>
              )}
            </section>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-nborder bg-bg/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={awarding}
            className="px-5 py-2.5 rounded-full border border-nborder text-sm font-semibold text-shadow hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleGotIt}
            disabled={awarding}
            className="px-5 py-2.5 rounded-full bg-amber text-shadow text-sm font-bold hover:opacity-95 transition inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {awarding ? "Saving…" : <>Got it <Check size={16} strokeWidth={3} /></>}
          </button>
        </div>
      </div>
    </div>
  );
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {filteredDarkVideos.map((v, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const letter = (v.title || "V").replace(/[^A-Za-z]/g, "").slice(0, 1) || "V";
            const caption = walkthroughCaption(v.description);
            const tag = (v.category_tag || "").trim();
            const dur = (v.duration || "").trim();
            const pill = tag ? tag.toUpperCase() : "Guide";
            const locked = v.is_locked;
            /** Fixed line boxes so line-clamp ellipsis lines up; avoids flex-1 “dead air” above the footer. */
            const titleBox = "h-[2.7rem] text-[15px] leading-[1.35]";
            /** Integer line metrics + outer clip: avoids 4th-line subpixel bleed from -webkit-line-clamp. */
            const captionClip = "h-[51px] overflow-hidden min-w-0 shrink-0 [contain:paint]";
            const captionText = "text-[13px] leading-[17px] text-white/88 line-clamp-3 m-0 p-0";
            return (
              <button
                key={v.id}
                type="button"
                disabled={locked}
                onClick={locked ? undefined : () => setModalVideo(v)}
                className={`relative text-left rounded-2xl overflow-hidden border min-h-[220px] h-full p-5 pt-6 flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] w-full min-w-0 text-white transition ${locked ? "border-white/5 opacity-50 cursor-default" : "border-white/10 cursor-pointer hover:border-amber/40"}`}
                style={{ backgroundColor: "#121212" }}
              >
                <div
                  className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full opacity-45 blur-2xl"
                  style={{ background: locked ? "#555" : accent }}
                />
                <div className="relative flex justify-start items-start mb-3 shrink-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[15px] font-black shadow-lg shrink-0"
                    style={{ background: accent }}
                  >
                    {locked ? <Lock size={18} className="text-white/50" /> : letter.toUpperCase()}
                  </div>
                </div>
                <div className="relative mb-3 min-w-0 shrink-0 space-y-1.5">
                  <div
                    className={`font-extrabold tracking-tight line-clamp-2 overflow-hidden ${titleBox} ${locked ? "text-white/50" : "text-amber"}`}
                    title={v.title}
                  >
                    {v.title}
                  </div>
                  {locked ? (
                    <div className={captionClip}>
                      <p className="text-[13px] leading-[17px] text-white/40 italic m-0 p-0">Login to unlock</p>
                    </div>
                  ) : caption ? (
                    <div className={captionClip}>
                      <p className={captionText} title={caption}>
                        {caption}
                      </p>
                    </div>
                  ) : (
                    <div className={captionClip} aria-hidden />
                  )}
                </div>
                <div className="relative flex items-end justify-between gap-2 mt-auto pt-1 min-w-0 shrink-0">
                  <span
                    className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-black/30 min-w-0 max-w-[72%] truncate"
                    style={{ borderColor: `${accent}88`, color: accent }}
                    title={pill}
                  >
                    {locked ? "LOCKED" : pill}
                  </span>
                  <span
                    className="text-[11px] font-bold tabular-nums text-white/90 shrink-0 truncate max-w-[28%]"
                    title={dur || undefined}
                  >
                    {dur || "—"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        )}

        {modalVideo ? <ApplyVideoDetailModal video={modalVideo} onClose={() => setModalVideo(null)} /> : null}
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {videos.map((v) => (
        <article
          key={v.id}
          className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-nborder flex flex-col min-w-0 ${v.is_locked ? "opacity-60" : ""}`}
        >
          <div className="relative w-full bg-black aspect-video">
            {v.is_locked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-shadow/20">
                <Lock size={28} className="text-white/60" />
              </div>
            ) : (
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
            )}
          </div>
          <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col min-w-0">
            <h2 className="font-bold text-sm text-shadow leading-snug line-clamp-2">{v.title}</h2>
            {v.is_locked ? (
              <p className="text-xs text-muted italic">Login to unlock</p>
            ) : v.description ? (
              <p className="text-xs text-muted leading-relaxed line-clamp-3 overflow-hidden min-w-0 flex-1">
                {v.description}
              </p>
            ) : null}
            {!v.is_locked && v.duration ? <p className="text-[10px] font-bold text-norange">{v.duration}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
