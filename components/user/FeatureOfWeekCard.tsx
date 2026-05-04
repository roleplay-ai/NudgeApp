"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import type { TrendingTopic } from "@/lib/types";

const ACCENT = "#F59E0B";

export default function FeatureOfWeekCard({ trending }: { trending: TrendingTopic }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full min-h-[280px]"
      >
        <div className="h-1 w-full shrink-0" style={{ background: ACCENT }} />
        <div className="p-5 flex flex-col flex-1">
          <div className="text-[10px] font-bold tracking-[0.14em] mb-2" style={{ color: ACCENT }}>
            FEATURE OF THE WEEK
          </div>
          <div className="text-lg font-extrabold text-shadow leading-snug mb-1">{trending.title}</div>
          <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4 flex-1">{trending.subtitle}</p>
          {trending.why_matters ? (
            <div className="rounded-xl p-3 mb-3 text-xs leading-relaxed" style={{ background: `${ACCENT}14` }}>
              <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: ACCENT }}>
                WHY IT MATTERS
              </div>
              <p className="text-shadow line-clamp-3">{trending.why_matters}</p>
            </div>
          ) : null}
          <span className="text-xs font-bold inline-flex items-center gap-1 mt-auto" style={{ color: ACCENT }}>
            Learn more <ArrowRight size={12} />
          </span>
        </div>
      </button>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-bg w-full md:max-w-lg md:rounded-2xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} style={{ color: ACCENT }} />
                <span className="text-[10px] font-bold tracking-[2px]" style={{ color: ACCENT }}>
                  FEATURE OF THE WEEK
                </span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-shadow rounded-lg p-1">
                <X size={20} />
              </button>
            </div>
            <div className="text-4xl mb-3">{trending.emoji}</div>
            <h2 className="text-2xl font-extrabold text-shadow mb-1.5 leading-tight">{trending.title}</h2>
            <p className="text-sm text-muted mb-4 leading-relaxed">{trending.subtitle}</p>
            <p className="text-sm text-shadow leading-relaxed mb-4">{trending.body}</p>
            {trending.why_matters ? (
              <div className="bg-chiffon rounded-xl p-3.5 mb-4">
                <div className="text-[11px] font-bold tracking-wider text-norange mb-1.5">WHY IT MATTERS</div>
                <div className="text-sm text-shadow leading-relaxed">{trending.why_matters}</div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full bg-amber text-shadow font-semibold py-3.5 rounded-full hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
