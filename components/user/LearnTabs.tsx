"use client";

import { useState } from "react";
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  Map,
  Search,
} from "lucide-react";
import type { World, Module, GlossaryTerm, Resource, ModuleScreen } from "@/lib/types";
import { getModuleWithScreens } from "@/app/actions/getModule";
import ModulePlayer from "@/components/user/ModulePlayer";

const LEVEL_STYLES: Record<string, string> = {
  beginner: "bg-emerald/15 text-emerald border border-emerald/30",
  intermediate: "bg-norange/15 text-norange border border-norange/25",
  advanced: "bg-fuchsia/12 text-fuchsia border border-fuchsia/25",
};

function resourceTitle(r: Resource & { name?: string }) {
  return r.title || (r as { name?: string }).name || "Untitled";
}

function parseLearnTab(tab: string | undefined | null): "worlds" | "glossary" | "resources" {
  const t = tab?.toLowerCase().trim();
  if (t === "glossary" || t === "resources" || t === "worlds") return t;
  return "worlds";
}

// ─── Main exported component ──────────────────────────────────────────────

export default function LearnTabs({
  worlds,
  modules,
  glossary,
  resources,
  initialTab,
}: {
  worlds: World[];
  modules: Module[];
  glossary: GlossaryTerm[];
  resources: Resource[];
  initialTab?: string | null;
}) {
  const [view, setView] = useState<"worlds" | "glossary" | "resources">(() =>
    parseLearnTab(initialTab)
  );

  const TABS = [
    { id: "worlds" as const, label: "Worlds", icon: Map },
    { id: "glossary" as const, label: "Glossary", icon: BookOpen },
    { id: "resources" as const, label: "Resources", icon: BookMarked },
  ] as const;

  return (
    <>
      {/* Tab switcher */}
      <div className="flex justify-center mb-7">
        <div
          className="flex gap-1 rounded-xl p-1 max-w-xl w-full"
          style={{
            background: "rgba(34,29,35,0.06)",
            border: "1px solid rgba(34,29,35,0.09)",
          }}
        >
          {TABS.map((it) => {
            const Ic = it.icon;
            const on = view === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setView(it.id)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150
                  ${on ? "bg-shadow text-amber shadow-md" : "text-muted hover:text-shadow hover:bg-white/60"}`}
              >
                <Ic size={14} strokeWidth={2} />
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

// ─── Worlds view ──────────────────────────────────────────────────────────

function WorldsView({ worlds, modules }: { worlds: World[]; modules: Module[] }) {
  const [openId, setOpenId] = useState<string | null>(worlds[0]?.id || null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<{
    module: Module;
    screens: ModuleScreen[];
  } | null>(null);

  async function handleOpenModule(m: Module) {
    if (m.is_locked || loadingId) return;
    setLoadingId(m.id);
    const data = await getModuleWithScreens(m.id);
    setLoadingId(null);
    if (data) setPlayerData(data);
  }

  return (
    <>
      <div className="space-y-3">
        {worlds.map((w) => {
          const wMods = modules.filter((m) => m.world_id === w.id);
          const isOpen = openId === w.id;
          return (
            <div
              key={w.id}
              className="rounded-2xl border border-nborder shadow-sm overflow-hidden bg-white transition-shadow hover:shadow-md"
              style={{ borderLeft: `3.5px solid ${w.color}` }}
            >
              {/* World header row */}
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : w.id)}
                className="w-full p-4 flex gap-3 items-center text-left transition"
                style={{ background: isOpen ? `${w.color}06` : undefined }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{
                    background: `${w.color}18`,
                    border: `1.5px solid ${w.color}40`,
                    boxShadow: `0 2px 8px ${w.color}20`,
                  }}
                >
                  {w.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-shadow">{w.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${w.color}18`, color: w.color }}
                    >
                      {wMods.length} module{wMods.length !== 1 ? "s" : ""}
                    </span>
                    {w.description && (
                      <span className="text-[11px] text-muted truncate">{w.description}</span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-muted transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* Module list */}
              {isOpen && (
                <div
                  className="px-4 pb-4 border-t pt-3"
                  style={{
                    borderColor: `${w.color}20`,
                    background: `${w.color}05`,
                  }}
                >
                  {wMods.map((m, idx) => {
                    const locked = m.is_locked;
                    const loading = loadingId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleOpenModule(m)}
                        disabled={locked || !!loadingId}
                        className={`w-full flex gap-3 items-start py-3 rounded-xl px-2 -mx-2 text-left transition group
                          ${locked ? "cursor-not-allowed opacity-55" : loading ? "cursor-wait" : "hover:bg-white/80 cursor-pointer"}`}
                      >
                        {/* Badge: number or lock */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-black transition-transform"
                          style={
                            locked
                              ? { background: "rgba(34,29,35,0.07)", color: "#9e8e7a", border: "1.5px solid rgba(34,29,35,0.12)" }
                              : { background: `${w.color}18`, color: w.color, border: `1.5px solid ${w.color}35` }
                          }
                        >
                          {locked ? <Lock size={12} strokeWidth={2.5} /> : idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[13px] font-bold leading-tight ${locked ? "text-muted" : "text-shadow"}`}
                            >
                              {m.title}
                            </span>
                            {locked && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-shadow/8 text-muted border border-shadow/10 uppercase tracking-wide">
                                Locked
                              </span>
                            )}
                          </div>
                          {m.concepts && m.concepts.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {m.concepts.slice(0, 3).map((c, ci) => (
                                <span
                                  key={ci}
                                  className="text-[10px] text-muted/80 bg-shadow/5 px-1.5 py-0.5 rounded-md font-medium"
                                >
                                  {c}
                                </span>
                              ))}
                              {m.concepts.length > 3 && (
                                <span className="text-[10px] text-muted">+{m.concepts.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {locked ? (
                          <Lock size={13} className="text-muted/40 shrink-0 mt-1" />
                        ) : loading ? (
                          <Loader2 size={14} className="shrink-0 mt-1 animate-spin" style={{ color: w.color }} />
                        ) : (
                          <ChevronRight
                            size={14}
                            className="text-muted/50 shrink-0 mt-1 group-hover:text-shadow group-hover:translate-x-0.5 transition"
                          />
                        )}
                      </button>
                    );
                  })}
                  {wMods.length === 0 && (
                    <div className="text-xs text-muted py-2 px-2">No modules yet.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {worlds.length === 0 && <div className="text-muted text-sm">No worlds published yet.</div>}
      </div>

      {/* Inline module player */}
      {playerData && (
        <ModulePlayer
          module={playerData.module}
          screens={playerData.screens}
          onClose={() => setPlayerData(null)}
        />
      )}
    </>
  );
}

// ─── Glossary view ────────────────────────────────────────────────────────

function GlossaryView({ glossary }: { glossary: GlossaryTerm[] }) {
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState("All");

  const availableLetters = Array.from(
    new Set(glossary.map((t) => t.term[0].toUpperCase()))
  ).sort();

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
      {/* Search input */}
      <div className="relative mb-4">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any AI term..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-nborder rounded-2xl text-sm shadow-sm
            focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 transition"
        />
      </div>

      {/* Letter filter */}
      <div className="flex gap-2 flex-wrap mb-5 justify-center sm:justify-start">
        {["All", ...availableLetters].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLetter(l)}
            className={`min-w-[2.25rem] h-9 px-2.5 rounded-full text-xs font-bold transition flex items-center justify-center
              ${
                letter === l
                  ? "bg-shadow text-amber shadow-sm min-w-[2.75rem]"
                  : "bg-white text-shadow border border-nborder hover:border-shadow/40"
              }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Term cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t) => {
          const c = t.color || "#623CEA";
          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-4 border border-nborder shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
              style={{ borderTop: `2.5px solid ${c}` }}
            >
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
                <div
                  className="rounded-xl px-3 py-2.5 text-[11px] italic leading-relaxed border"
                  style={{ background: `${c}10`, borderColor: `${c}30`, color: c }}
                >
                  e.g. &lsquo;{t.example}&rsquo;
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-muted text-sm py-6 text-center">No terms found.</div>
      )}
    </div>
  );
}

// ─── Resources view ───────────────────────────────────────────────────────

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
      {/* Level filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {(["All", "beginner", "intermediate", "advanced"] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevel(lv)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition
              ${level === lv ? "bg-shadow text-amber shadow-sm" : "bg-white text-shadow border border-nborder hover:border-shadow/40"}`}
          >
            {lv}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {types.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 capitalize transition
              ${filter === c ? "bg-shadow text-amber shadow-sm" : "bg-white text-shadow border border-nborder hover:border-shadow/40"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-amber/25" />
            <span className="text-[10px] font-black tracking-[0.25em] text-norange px-2">
              FEATURED
            </span>
            <div className="h-px flex-1 bg-amber/25" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {featured.map((r) => (
              <FeaturedResourceCard key={r.id} r={r} />
            ))}
          </div>
        </>
      )}

      {/* Others */}
      {others.length > 0 && (
        <div>
          {featured.length > 0 && (
            <div className="text-[10px] font-black tracking-[0.2em] text-muted mb-3">
              MORE RESOURCES
            </div>
          )}
          <div className="space-y-2.5">
            {others.map((r) => (
              <WideResourceRow key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-muted text-sm py-6">No resources in this filter.</div>
      )}
    </div>
  );
}

function levelClass(level: string | null | undefined) {
  const k = (level || "").toLowerCase();
  return LEVEL_STYLES[k] || "bg-chiffon text-shadow border border-nborder";
}

function FeaturedResourceCard({ r }: { r: Resource }) {
  const title = resourceTitle(r);
  const grad = r.thumbnail_url
    ? "linear-gradient(135deg,#623CEA,#3696FC)"
    : "linear-gradient(135deg,#F68A29,#FFCE00)";
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl border border-nborder shadow-sm hover:shadow-lg transition-all overflow-hidden p-5 min-h-[180px]"
      style={{ borderTop: "3px solid #F68A29" }}
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
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${levelClass(r.level)}`}
              >
                {r.level}
              </span>
            )}
          </div>
          {r.author && (
            <div className="text-[11px] text-muted font-medium mb-1">{r.author}</div>
          )}
          <p className="text-[13px] text-muted leading-snug line-clamp-3">{r.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-nborder">
        <span className="text-[11px] text-muted inline-flex items-center gap-1">
          <Clock size={12} /> Self-paced
        </span>
        <span className="text-[12px] font-extrabold text-norange inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
      className="flex gap-4 items-center bg-white rounded-2xl border border-nborder p-4 shadow-sm hover:shadow-md transition group"
      style={{ borderLeft: `3px solid ${bg}` }}
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
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${levelClass(r.level)}`}
            >
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
        <ExternalLink
          size={14}
          className="text-muted group-hover:text-norange transition-colors inline-block"
        />
      </div>
    </a>
  );
}
