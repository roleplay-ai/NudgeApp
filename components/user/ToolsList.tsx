"use client";

import { useState } from "react";
import { Check, ExternalLink, X } from "lucide-react";
import type { Tool } from "@/lib/types";

export default function ToolsList({ tools }: { tools: Tool[] }) {
  const cats = ["All", ...Array.from(new Set(tools.map((t) => t.category)))];
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<Tool | null>(null);
  const filtered = filter === "All" ? tools : tools.filter((t) => t.category === filter);

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {cats.map((c) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t) => {
          const accent = t.color || "#623CEA";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpen(t)}
              className="text-left bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden flex flex-col min-h-[220px]"
            >
              <div className="h-1 w-full shrink-0" style={{ background: accent }} />
              <div className="p-4 flex flex-col flex-1">
                <div className="flex gap-3 items-start mb-2">
                  <div
                    className="w-11 h-11 rounded-xl text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: accent }}
                  >
                    {t.letter || t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-sm font-extrabold text-shadow">{t.name}</span>
                      {t.is_featured && (
                        <span className="text-[9px] font-bold bg-amber text-shadow px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted leading-snug line-clamp-2">{t.description || t.best_for}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                  <div>
                    <div className="text-[9px] font-bold tracking-wider text-muted">PRICING</div>
                    <div className="text-[12px] font-bold text-shadow leading-tight">{t.pricing || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold tracking-wider text-muted">CATEGORY</div>
                    <div className="text-[12px] font-bold leading-tight" style={{ color: accent }}>
                      {t.category}
                    </div>
                  </div>
                </div>
                {t.best_for && (
                  <div className="rounded-xl px-3 py-2 mb-3 text-[11px] text-shadow leading-snug" style={{ background: `${accent}14` }}>
                    <span className="font-bold">Use for:</span> {t.best_for}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-auto mb-2">
                  {(t.pros || []).slice(0, 2).map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-shadow bg-[#E6FBEC] px-2 py-0.5 rounded-full border border-emerald/25"
                    >
                      <Check size={10} className="text-emerald shrink-0" />
                      <span className="line-clamp-1">{p}</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-end justify-between pt-2 border-t border-nborder mt-auto">
                  <span className="text-[10px] text-muted">Click for full details</span>
                  <span className="text-xs font-extrabold flex items-center gap-0.5" style={{ color: accent }}>
                    Explore <span aria-hidden>›</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {open && <ToolModal tool={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function ToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const accent = tool.color || "#ED4551";
  const secondary = "#F9A8D4";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-nborder"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative px-5 pt-6 pb-5 text-white shrink-0"
          style={{
            background: `linear-gradient(125deg, ${accent} 0%, ${secondary} 55%, #221D23 100%)`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/90 hover:bg-white/15"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex gap-3 items-start pr-10">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-2xl border border-white/30">
              {tool.letter || tool.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold leading-tight">{tool.name}</h2>
              <p className="text-sm text-white/90 mt-0.5">{tool.description || tool.best_for}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tool.is_featured && (
                  <span className="text-[9px] font-bold bg-amber text-shadow px-2 py-0.5 rounded-full">Featured</span>
                )}
                <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/25">
                  {tool.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-3 flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-nborder bg-bg px-3 py-2.5">
              <div className="text-[9px] font-bold tracking-wider text-muted mb-0.5">PRICING</div>
              <div className="text-sm font-bold text-shadow">{tool.pricing || "—"}</div>
            </div>
            <div className="rounded-xl border border-nborder bg-bg px-3 py-2.5">
              <div className="text-[9px] font-bold tracking-wider text-muted mb-0.5">BEST FOR</div>
              <div className="text-sm font-bold text-shadow leading-snug">{tool.best_for || "—"}</div>
            </div>
          </div>

          {tool.pros && tool.pros.length > 0 && (
            <div className="rounded-xl bg-[#E8FBEE] border border-emerald/20 p-3">
              <div className="text-[9px] font-bold tracking-wider text-emerald mb-2">PROS</div>
              <ul className="space-y-1.5">
                {tool.pros.map((p, i) => (
                  <li key={i} className="text-sm text-shadow flex gap-2 leading-snug">
                    <Check size={16} className="text-emerald shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tool.cons && tool.cons.length > 0 && (
            <div className="rounded-xl bg-[#FDE9EB] border border-fuchsia/20 p-3">
              <div className="text-[9px] font-bold tracking-wider text-fuchsia mb-2">CONS</div>
              <ul className="space-y-1.5">
                {tool.cons.map((c, i) => (
                  <li key={i} className="text-sm text-shadow flex gap-2 leading-snug">
                    <X size={16} className="text-fuchsia shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-nborder text-shadow font-semibold py-3 rounded-full hover:bg-bg text-sm"
            >
              Close
            </button>
            {tool.url && (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] font-semibold py-3 rounded-full text-sm text-shadow flex items-center justify-center gap-2 hover:opacity-95"
                style={{ background: accent, color: "#fff" }}
              >
                Try {tool.name} <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
