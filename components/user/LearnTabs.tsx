"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Map,
  Search,
} from "lucide-react";
import type { World, Module, GlossaryTerm, Resource } from "@/lib/types";

const LEVEL_STYLES: Record<string, string> = {
  beginner: "bg-emerald/15 text-emerald border border-emerald/30",
  intermediate: "bg-norange/15 text-norange border border-norange/25",
  advanced: "bg-fuchsia/12 text-fuchsia border border-fuchsia/25",
};

function resourceTitle(r: Resource & { name?: string }) {
  return r.title || (r as { name?: string }).name || "Untitled";
}

export default function LearnTabs({
  worlds,
  modules,
  glossary,
  resources,
}: {
  worlds: World[];
  modules: Module[];
  glossary: GlossaryTerm[];
  resources: Resource[];
}) {
  const [view, setView] = useState<"worlds" | "glossary" | "resources">("worlds");

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-nborder max-w-xl w-full">
          {(
            [
              { id: "worlds" as const, label: "Worlds", icon: Map },
              { id: "glossary" as const, label: "Glossary", icon: BookOpen },
              { id: "resources" as const, label: "Resources", icon: BookMarked },
            ] as const
          ).map((it) => {
            const Ic = it.icon;
            const on = view === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setView(it.id)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition
                  ${on ? "bg-shadow text-amber shadow-sm" : "text-muted hover:text-shadow"}`}
              >
                <Ic size={14} strokeWidth={2} className={on ? "text-amber" : ""} />
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "worlds" && <WorldsView worlds={worlds} modules={modules} />}
      {view === "glossary" && <GlossaryView glossary={glossary} />}
      {view === "resources" && <ResourcesView resources={resources} />}
    </>
  );
}

function WorldsView({ worlds, modules }: { worlds: World[]; modules: Module[] }) {
  const [openId, setOpenId] = useState<string | null>(worlds[0]?.id || null);
  return (
    <div className="space-y-3">
      {worlds.map((w) => {
        const wMods = modules.filter((m) => m.world_id === w.id);
        const isOpen = openId === w.id;
        return (
          <div key={w.id} className="bg-white rounded-2xl border border-nborder shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : w.id)}
              className="w-full p-4 flex gap-3 items-center text-left hover:bg-chiffon/30 transition"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl border border-nborder"
                style={{ background: `${w.color}18` }}
              >
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold text-shadow">{w.title}</div>
                <div className="text-[11px] text-muted font-medium">{wMods.length} modules</div>
              </div>
              <ChevronRight size={18} className={`text-muted transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-nborder pt-3 bg-bg/50">
                {wMods.map((m) => (
                  <Link
                    key={m.id}
                    href={`/learn/${m.id}`}
                    className="flex gap-3 items-start py-2.5 hover:bg-chiffon/50 rounded-xl px-2 -mx-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-chiffon border border-nborder flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-shadow">▶</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-shadow">{m.title}</div>
                      {m.concepts && m.concepts.length > 0 && (
                        <div className="text-[10px] text-muted mt-0.5">{m.concepts.join(" · ")}</div>
                      )}
                    </div>
                  </Link>
                ))}
                {wMods.length === 0 && <div className="text-xs text-muted py-2">No modules yet.</div>}
              </div>
            )}
          </div>
        );
      })}
      {worlds.length === 0 && <div className="text-muted text-sm">No worlds published yet.</div>}
    </div>
  );
}

function GlossaryView({ glossary }: { glossary: GlossaryTerm[] }) {
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState("All");

  const availableLetters = Array.from(new Set(glossary.map((t) => t.term[0].toUpperCase()))).sort();

  const filtered = glossary.filter((t) => {
    const matchesLetter = letter === "All" || t.term[0].toUpperCase() === letter;
    const matchesSearch =
      !search ||
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    return matchesLetter && matchesSearch;
  });

  return (
    <div>
      <div className="relative mb-4">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any AI term..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-nborder rounded-2xl text-sm shadow-sm
            focus:outline-none focus:ring-2 focus:ring-shadow/12 focus:border-shadow"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-5 justify-center sm:justify-start">
        {["All", ...availableLetters].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLetter(l)}
            className={`min-w-[2.25rem] h-9 px-2.5 rounded-full text-xs font-bold transition flex items-center justify-center
              ${
                letter === l
                  ? "bg-shadow text-amber min-w-[2.75rem]"
                  : "bg-white text-shadow border border-nborder hover:border-shadow"
              }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t) => {
          const c = t.color || "#623CEA";
          return (
            <div key={t.id} className="bg-white rounded-2xl p-4 border border-nborder shadow-sm flex flex-col gap-3">
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-xl text-white font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: c }}
                >
                  {t.term[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-shadow leading-tight">{t.term}</div>
                  <div className="text-[12px] text-muted mt-1 leading-snug">{t.definition}</div>
                </div>
              </div>
              {t.example && (
                <div className="rounded-xl px-3 py-2.5 text-[11px] italic leading-relaxed border" style={{ background: `${c}12`, borderColor: `${c}35`, color: c }}>
                  e.g. &lsquo;{t.example}&rsquo;
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="text-muted text-sm py-6 text-center">No terms found.</div>}
    </div>
  );
}

function ResourcesView({ resources }: { resources: Resource[] }) {
  const types = ["All", ...Array.from(new Set(resources.map((r) => r.resource_type)))];
  const [filter, setFilter] = useState("All");
  const [level, setLevel] = useState<"All" | "beginner" | "intermediate" | "advanced">("All");
  const byType = filter === "All" ? resources : resources.filter((r) => r.resource_type === filter);
  const filtered =
    level === "All" ? byType : byType.filter((r) => (r.level || "").toLowerCase() === level);
  const featured = filtered.filter((r) => r.is_featured);
  const others = filtered.filter((r) => !r.is_featured);

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-3">
        {(["All", "beginner", "intermediate", "advanced"] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevel(lv)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition
              ${level === lv ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder hover:border-shadow"}`}
          >
            {lv}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {types.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 capitalize transition
              ${filter === c ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder hover:border-shadow"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <>
          <div className="text-[10px] font-bold tracking-[0.2em] text-norange mb-3">FEATURED</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {featured.map((r) => (
              <FeaturedResourceCard key={r.id} r={r} />
            ))}
          </div>
        </>
      )}

      {others.length > 0 && (
        <div>
          {featured.length > 0 && (
            <div className="text-[10px] font-bold tracking-[0.2em] text-muted mb-3">MORE RESOURCES</div>
          )}
          <div className="space-y-2.5">
            {others.map((r) => (
              <WideResourceRow key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && <div className="text-muted text-sm py-6">No resources in this filter.</div>}
    </div>
  );
}

function levelClass(level: string | null | undefined) {
  const k = (level || "").toLowerCase();
  return LEVEL_STYLES[k] || "bg-chiffon text-shadow border border-nborder";
}

function FeaturedResourceCard({ r }: { r: Resource }) {
  const title = resourceTitle(r);
  const grad = r.thumbnail_url ? "linear-gradient(135deg,#623CEA,#3696FC)" : "linear-gradient(135deg,#F68A29,#FFCE00)";
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-md transition overflow-hidden p-5 min-h-[180px]"
    >
      <div className="flex gap-4 flex-1">
        <div
          className="w-14 h-14 rounded-xl text-white font-black text-xl flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: grad }}
        >
          {r.thumbnail_url ? (
            <img src={r.thumbnail_url} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            title[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-base font-extrabold text-shadow leading-tight">{title}</span>
            {r.level && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${levelClass(r.level)}`}>
                {r.level}
              </span>
            )}
          </div>
          {r.author && <div className="text-[11px] text-muted font-medium mb-1">{r.author}</div>}
          <p className="text-[13px] text-muted leading-snug line-clamp-3">{r.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-nborder">
        <span className="text-[11px] text-muted inline-flex items-center gap-1">
          <Clock size={12} /> Self-paced
        </span>
        <span className="text-[12px] font-extrabold text-norange inline-flex items-center gap-1">
          Open <ExternalLink size={12} />
        </span>
      </div>
    </a>
  );
}

const ROW_COLORS = ["#F68A29", "#ED4551", "#623CEA", "#3696FC", "#23CE68"];

function WideResourceRow({ r }: { r: Resource }) {
  const title = resourceTitle(r);
  const dur =
    r.duration_mins != null
      ? `${r.duration_mins >= 120 ? "2~4" : r.duration_mins} ${r.duration_mins >= 120 ? "hrs" : "min"}`
      : null;
  const bg = ROW_COLORS[(title.charCodeAt(0) || 0) % ROW_COLORS.length];

  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 items-center bg-white rounded-2xl border border-nborder p-4 shadow-sm hover:shadow-md transition"
    >
      <div
        className="w-11 h-11 rounded-xl text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: bg }}
      >
        {r.thumbnail_url ? (
          <img src={r.thumbnail_url} alt="" className="w-full h-full rounded-xl object-cover" />
        ) : (
          title[0]?.toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-extrabold text-shadow">{title}</span>
          {r.level && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${levelClass(r.level)}`}>
              {r.level}
            </span>
          )}
          {r.resource_type && (
            <span className="text-[9px] font-bold text-muted capitalize border border-nborder px-2 py-0.5 rounded-full">
              {r.resource_type}
            </span>
          )}
        </div>
        <p className="text-[12px] text-muted leading-snug line-clamp-2">{r.description}</p>
      </div>
      <div className="text-right shrink-0">
        {dur && <div className="text-[11px] font-bold text-shadow mb-1">{dur}</div>}
        <ExternalLink size={14} className="text-muted inline-block" />
      </div>
    </a>
  );
}
