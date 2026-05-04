"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type { ApplyPlatform, ApplyTile } from "@/lib/types";
import { youtubeEmbedSrc } from "@/lib/youtubeEmbed";

const GROUP_ORDER = ["Features", "Apps", "Workflows", "Skills"] as const;

const GROUP_ACCENT: Record<string, string> = {
  Features: "#A855F7",
  Apps: "#EC4899",
  Workflows: "#F59E0B",
  Skills: "#3B82F6",
};

const FALLBACK_DOTS = ["#A855F7", "#FFCE00", "#23CE68"];

function sortTiles(tiles: ApplyTile[]) {
  return [...tiles].sort((a, b) => {
    const ga = GROUP_ORDER.indexOf(a.group_name as (typeof GROUP_ORDER)[number]);
    const gb = GROUP_ORDER.indexOf(b.group_name as (typeof GROUP_ORDER)[number]);
    const oa = ga === -1 ? 99 : ga;
    const ob = gb === -1 ? 99 : gb;
    if (oa !== ob) return oa - ob;
    return a.order_index - b.order_index;
  });
}

function tileAccent(t: ApplyTile) {
  return (t.icon_color && t.icon_color.trim()) || GROUP_ACCENT[t.group_name] || "#623CEA";
}

function parsePlatforms(tile: ApplyTile): ApplyPlatform[] {
  const raw = tile.available_in as unknown;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
      .map((x) => ({
        name: String(x.name ?? ""),
        color: (x.color as string) || "#6B6B6B",
      }))
      .filter((p) => p.name.length > 0);
  }
  return [];
}

function dotColors(tile: ApplyTile, accent: string): string[] {
  const pl = parsePlatforms(tile);
  if (pl.length >= 3) return pl.slice(0, 3).map((p) => p.color || "#888");
  if (pl.length === 2) return [pl[0].color || accent, pl[1].color || "#FFCE00", accent];
  if (pl.length === 1) return [pl[0].color || accent, "#FFCE00", "#23CE68"];
  return [accent, FALLBACK_DOTS[1], FALLBACK_DOTS[2]];
}

function cardCategoryLabel(t: ApplyTile): string {
  return (t.category_tag || t.group_name || "").toUpperCase();
}

function iconLetter(title: string) {
  return title.replace(/[^A-Za-z]/g, "").slice(0, 1) || "A";
}

export default function ApplyTilesExplore({ tiles }: { tiles: ApplyTile[] }) {
  const sorted = useMemo(() => sortTiles(tiles), [tiles]);
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<ApplyTile | null>(null);

  const chips = ["All", ...GROUP_ORDER];
  const filtered = useMemo(() => {
    if (filter === "All") return sorted;
    return sorted.filter((t) => t.group_name === filter);
  }, [sorted, filter]);

  return (
    <>
      <p className="text-sm text-muted mb-4 max-w-2xl">
        Browse features, apps, and workflows. Click any card to learn more.
      </p>

      <div className="flex gap-2 flex-wrap mb-3">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition
              ${filter === c ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder hover:border-shadow"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-[11px] font-bold text-muted mb-4">{filtered.length} items</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t) => {
          const accent = tileAccent(t);
          const letter = iconLetter(t.title);
          const dots = dotColors(t, accent);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpen(t)}
              className="relative text-left rounded-2xl overflow-hidden border border-white/10
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] min-h-[158px] p-4 pt-5 text-white
                hover:border-amber/40 transition group"
              style={{ backgroundColor: "#121212" }}
            >
              <div
                className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full opacity-45 blur-2xl"
                style={{ background: accent }}
              />
              <div className="relative flex justify-start items-start mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg overflow-hidden shrink-0"
                  style={{ background: accent }}
                >
                  {t.icon_url ? (
                    <img src={t.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    letter.toUpperCase()
                  )}
                </div>
              </div>
              <div className="relative font-extrabold text-amber text-[14px] leading-snug mb-1 line-clamp-2 tracking-tight">
                {t.title}
              </div>
              <p className="relative text-[12px] text-white/88 leading-snug line-clamp-2 mb-4 min-h-[2.5rem]">{t.subtitle}</p>
              <div className="relative flex items-end justify-between gap-2 mt-auto pt-1">
                <span
                  className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border bg-black/30 max-w-[70%] truncate"
                  style={{ borderColor: `${accent}88`, color: accent }}
                >
                  {cardCategoryLabel(t)}
                </span>
                <span className="flex gap-0.5 shrink-0">
                  {dots.map((c, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                  ))}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {open && <TileDetailModal tile={open} accent={tileAccent(open)} onClose={() => setOpen(null)} />}
    </>
  );
}

function TileDetailModal({ tile, accent, onClose }: { tile: ApplyTile; accent: string; onClose: () => void }) {
  const embed = youtubeEmbedSrc(tile.video_url);
  const platforms = parsePlatforms(tile);
  const what = (tile.what_it_does || "").trim() || tile.subtitle;
  const groupPill = tile.group_name || "Features";
  const cat = (tile.category_tag || "").trim();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-xl md:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-nborder"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-5 pt-5 pb-4 border-b border-nborder shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-chiffon hover:text-shadow"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex gap-3 pr-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0 overflow-hidden shadow-md"
              style={{ background: accent }}
            >
              {tile.icon_url ? (
                <img src={tile.icon_url} alt="" className="w-full h-full object-cover" />
              ) : (
                iconLetter(tile.title).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: accent }}
                >
                  {groupPill}
                </span>
                {cat && <span className="text-[12px] font-medium text-muted capitalize">{cat}</span>}
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-shadow leading-tight">{tile.title}</h2>
              <p className="text-sm text-muted mt-0.5">{tile.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {embed ? (
            <div className="aspect-video bg-[#1a1a1a] w-full">
              <iframe
                title={`Video: ${tile.title}`}
                src={embed}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-[#2a2a2a] flex items-center justify-center text-white/50 text-sm px-6 text-center">
              Add a YouTube URL in Admin → Apply tiles to show a video here.
            </div>
          )}

          <div className="px-5 py-5 space-y-6">
            <section>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-norange mb-2">WHAT IT DOES</h3>
              <p className="text-sm text-shadow leading-relaxed whitespace-pre-wrap">{what}</p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-norange mb-3">AVAILABLE IN</h3>
              {platforms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <span
                      key={p.name}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-nborder bg-white text-sm font-semibold text-shadow"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || "#888" }} />
                      {p.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">Add platforms as JSON in Admin (e.g. ChatGPT, Claude).</p>
              )}
            </section>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-nborder bg-bg/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-nborder text-sm font-semibold text-shadow hover:bg-white transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-amber text-shadow text-sm font-bold hover:opacity-95 transition inline-flex items-center gap-1.5"
          >
            Got it <Check size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
