"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, ExternalLink, GraduationCap, Library, Search } from "lucide-react";
import type { World, Module, GlossaryTerm, Resource } from "@/lib/types";

export default function LearnTabs({ worlds, modules, glossary, resources }: {
  worlds: World[]; modules: Module[]; glossary: GlossaryTerm[]; resources: Resource[];
}) {
  const [view, setView] = useState<"worlds" | "glossary" | "resources">("worlds");

  return (
    <>
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-5 max-w-md">
        {[
          { id: "worlds", label: "Worlds", icon: GraduationCap },
          { id: "glossary", label: "Glossary", icon: BookOpen },
          { id: "resources", label: "Resources", icon: Library },
        ].map((it) => {
          const Ic = it.icon;
          return (
            <button key={it.id} onClick={() => setView(it.id as any)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1
                ${view === it.id ? "bg-shadow text-amber" : "text-muted hover:text-shadow"}`}>
              <Ic size={13} /> {it.label}
            </button>
          );
        })}
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
    <div className="space-y-2.5">
      {worlds.map((w) => {
        const wMods = modules.filter((m) => m.world_id === w.id);
        const isOpen = openId === w.id;
        return (
          <div key={w.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => setOpenId(isOpen ? null : w.id)}
              className="w-full p-3.5 flex gap-3 items-center text-left">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: w.color + "20" }}>
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-shadow">{w.title}</div>
                <div className="text-[11px] text-muted">{wMods.length} modules</div>
              </div>
              <ChevronRight size={18} className={`text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-3.5 pb-3.5 border-t border-nborder pt-3">
                {wMods.map((m) => (
                  <Link key={m.id} href={`/learn/${m.id}`}
                    className="flex gap-3 items-start py-2.5 hover:bg-chiffon/40 rounded-lg px-2 -mx-2">
                    <div className="w-7 h-7 rounded-full bg-chiffon flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-shadow">▶</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-shadow">{m.title}</div>
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
  const filtered = glossary.filter((t) =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.definition.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-3.5 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Vector, MCP, Token…"
          className="w-full pl-10 pr-4 py-3 bg-chiffon border-0 rounded-xl text-sm" />
      </div>
      <div className="text-[11px] text-muted font-semibold mb-2">{filtered.length} terms</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white rounded-xl p-3 shadow-sm flex gap-3">
            <div className="w-9 h-9 rounded-lg text-white font-extrabold text-base flex items-center justify-center flex-shrink-0"
              style={{ background: t.color || "#623CEA" }}>
              {t.term[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-shadow">{t.term}</div>
              <div className="text-[12px] text-muted mt-0.5 leading-snug">{t.definition}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesView({ resources }: { resources: Resource[] }) {
  const types = ["All", ...Array.from(new Set(resources.map((r) => r.resource_type)))];
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? resources : resources.filter((r) => r.resource_type === filter);
  const featured = filtered.filter((r) => r.is_featured);
  const others = filtered.filter((r) => !r.is_featured);

  return (
    <div>
      <p className="text-sm text-muted mb-4">Curated resources from the best AI sources.</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {types.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 capitalize
              ${filter === c ? "bg-shadow text-amber" : "bg-white text-shadow border border-nborder"}`}>
            {c}
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <>
          <div className="text-[11px] font-bold tracking-wider text-norange mb-2">★ FEATURED</div>
          <div className="space-y-2.5 mb-5">
            {featured.map((r) => <ResourceCard key={r.id} r={r} large />)}
          </div>
        </>
      )}

      {others.length > 0 && (
        <div className="space-y-2.5">
          {featured.length > 0 && <div className="text-[11px] font-bold tracking-wider text-muted mb-2">MORE</div>}
          {others.map((r) => <ResourceCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}

function ResourceCard({ r, large }: { r: Resource; large?: boolean }) {
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer"
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition flex gap-3"
      style={large ? { borderLeft: "4px solid #F68A29" } : {}}>
      <div className={`${large ? "w-12 h-12 text-xl" : "w-10 h-10 text-base"} rounded-xl bg-norange text-white font-black flex items-center justify-center flex-shrink-0`}>
        {r.thumbnail_url
          ? <img src={r.thumbnail_url} alt="" className="w-full h-full rounded-xl object-cover" />
          : r.title[0]
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="text-sm font-bold text-shadow">{r.title}</span>
          <span className="text-[10px] font-bold bg-chiffon text-shadow px-2 py-0.5 rounded-full capitalize">{r.resource_type}</span>
          {r.level && <span className="text-[10px] text-muted capitalize">{r.level}</span>}
          {r.author && <span className="text-[10px] text-muted">by {r.author}</span>}
        </div>
        <div className="text-[12px] text-muted leading-snug line-clamp-2">{r.description}</div>
        <div className="mt-1 text-[11px] text-dodger font-bold inline-flex items-center gap-1">
          Open <ExternalLink size={10} />
        </div>
      </div>
    </a>
  );
}
