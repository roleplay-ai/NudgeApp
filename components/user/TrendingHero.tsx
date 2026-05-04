"use client";
import { useState } from "react";
import { ArrowRight, TrendingUp, X } from "lucide-react";
import type { TrendingTopic } from "@/lib/types";

export default function TrendingHero({ trending }: { trending: TrendingTopic }) {
  const [open, setOpen] = useState(false);
  const color = "#623CEA";

  return (
    <>
      <section onClick={() => setOpen(true)}
        className="rounded-2xl p-5 cursor-pointer relative overflow-hidden text-white border border-white/10 shadow-lg"
        style={{ background: color }}>
        <div className="absolute -right-5 -top-3 text-[130px] opacity-15 leading-none select-none">
          {trending.emoji}
        </div>
        <div className="flex items-center gap-1.5 mb-2.5 relative">
          <TrendingUp size={14} className="text-amber" />
          <span className="text-[10px] font-bold tracking-[2px] text-amber">TRENDING NOW</span>
        </div>
        <div className="text-xl md:text-2xl font-extrabold mb-1.5 relative">{trending.title}</div>
        <div className="text-sm opacity-80 mb-3.5 relative">{trending.subtitle}</div>
        <div className="inline-flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full text-xs font-semibold relative">
          Read more <ArrowRight size={12} />
        </div>
      </section>

      {open && (
        <div onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <div onClick={(e) => e.stopPropagation()}
            className="bg-bg w-full md:max-w-lg md:rounded-2xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} style={{ color }} />
                <span className="text-[10px] font-bold tracking-[2px]" style={{ color }}>TRENDING NOW</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-shadow">
                <X size={20} />
              </button>
            </div>
            <div className="text-5xl mb-3">{trending.emoji}</div>
            <h2 className="text-2xl font-extrabold text-shadow mb-1.5 leading-tight">{trending.title}</h2>
            <p className="text-sm text-muted mb-4 leading-relaxed">{trending.subtitle}</p>
            <p className="text-sm text-shadow leading-relaxed mb-4">{trending.body}</p>
            {trending.why_matters && (
              <div className="bg-chiffon rounded-xl p-3.5 mb-4">
                <div className="text-[11px] font-bold tracking-wider text-norange mb-1.5">WHY THIS MATTERS</div>
                <div className="text-sm text-shadow leading-relaxed">{trending.why_matters}</div>
              </div>
            )}
            <button onClick={() => setOpen(false)}
              className="w-full bg-amber text-shadow font-semibold py-3.5 rounded-full hover:opacity-90">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
