"use client";
import { useState } from "react";
import { Building2, Calendar, ChevronRight, Globe, ThumbsDown, ThumbsUp, Wrench, X, Zap } from "lucide-react";
import type { Tool } from "@/lib/types";

export default function ToolsList({ tools }: { tools: Tool[] }) {
  const cats = ["All", ...Array.from(new Set(tools.map((t) => t.category)))];
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<Tool | null>(null);
  const filtered = filter === "All" ? tools : tools.filter((t) => t.category === filter);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0
              ${filter === c ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((t) => (
          <button key={t.id} onClick={() => setOpen(t)}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex gap-3 items-center text-left">
            <div className="w-11 h-11 rounded-xl text-white font-extrabold flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: t.color || "#623CEA" }}>
              {t.letter || t.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-sm font-bold text-shadow">{t.name}</span>
                <span className="text-[10px] font-bold bg-chiffon text-shadow px-2 py-0.5 rounded-full">{t.category}</span>
              </div>
              <div className="text-[12px] text-muted truncate">{t.best_for || t.description}</div>
            </div>
            <ChevronRight size={16} className="text-muted flex-shrink-0" />
          </button>
        ))}
      </div>

      {open && <ToolModal tool={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function ToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  return (
    <div onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div onClick={(e) => e.stopPropagation()}
        className="bg-bg w-full md:max-w-lg md:rounded-2xl rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-muted hover:text-shadow">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-3 items-center mb-4">
          <div className="w-14 h-14 rounded-xl text-white font-black text-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: tool.color || "#623CEA" }}>
            {tool.letter || tool.name[0]}
          </div>
          <div className="flex-1">
            <div className="text-xl font-extrabold text-shadow">{tool.name}</div>
            <div className="text-xs text-muted">{tool.description}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {tool.company && <FactTile icon={<Building2 size={14} />} label="Company" value={tool.company} />}
          {tool.founded && <FactTile icon={<Calendar size={14} />} label="Founded" value={String(tool.founded)} />}
          <FactTile icon={<Wrench size={14} />} label="Category" value={tool.category} />
          {tool.pricing && <FactTile icon={<Zap size={14} />} label="Pricing" value={tool.pricing} />}
        </div>

        {tool.best_for && (
          <div className="bg-chiffon rounded-xl p-3 mb-4">
            <div className="text-[10px] font-bold tracking-wider text-norange mb-1">BEST FOR</div>
            <div className="text-sm text-shadow leading-relaxed">{tool.best_for}</div>
          </div>
        )}

        {tool.pros && tool.pros.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ThumbsUp size={14} className="text-emerald" />
              <span className="text-sm font-bold text-shadow">What's good</span>
            </div>
            <div className="space-y-1.5">
              {tool.pros.map((p, i) => (
                <div key={i} className="bg-[#E6FBEC] rounded-xl px-3 py-2 text-sm text-shadow leading-snug">{p}</div>
              ))}
            </div>
          </div>
        )}

        {tool.cons && tool.cons.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ThumbsDown size={14} className="text-fuchsia" />
              <span className="text-sm font-bold text-shadow">What's not</span>
            </div>
            <div className="space-y-1.5">
              {tool.cons.map((c, i) => (
                <div key={i} className="bg-[#FDE9EB] rounded-xl px-3 py-2 text-sm text-shadow leading-snug">{c}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 border border-nborder text-shadow font-semibold py-3 rounded-full hover:bg-white">
            Close
          </button>
          {tool.url && (
            <a href={tool.url} target="_blank" rel="noopener noreferrer"
              className="flex-[2] bg-amber text-shadow font-semibold py-3 rounded-full hover:opacity-90 flex items-center justify-center gap-2">
              <Globe size={14} /> Visit website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function FactTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-2.5">
      <div className="flex items-center gap-1 text-muted mb-0.5">
        {icon}
        <span className="text-[9px] font-bold tracking-wider uppercase">{label}</span>
      </div>
      <div className="text-[13px] font-bold text-shadow">{value}</div>
    </div>
  );
}
