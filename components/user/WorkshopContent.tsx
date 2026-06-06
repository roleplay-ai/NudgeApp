"use client";

import { useState, useRef } from "react";
import { X, Hammer, ArrowRight } from "lucide-react";
import styles from "./WorkshopContent.module.css";
import type { Company } from "@/lib/types";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Workflow {
  title: string;
  desc: string;
  tool: string;
  type: string;
  level: string;
  status: string;
  apps: string[];
  collection: string;
  isNew: boolean;
}

const workflows: Workflow[] = [
  { title: "Connect your apps with Claude",                desc: "Connect Gmail, Calendar & Drive with Claude.",                                                                tool: "Claude", type: "Chat",       level: "Beginner",     status: "Not Started", apps: ["Drive", "Email"],          collection: "Claude Essentials", isNew: false },
  { title: "Pick the Right Model and Thinking Level",     desc: "Match Claude's model and effort settings to the complexity of your task.",                                     tool: "Claude", type: "Chat",       level: "Beginner",     status: "Not Started", apps: ["Chat", "Docs", "PDF"],     collection: "Claude Essentials", isNew: false },
  { title: "Save Time and Tokens with Projects",          desc: "Create a project, write custom instructions, upload reference files, and manage memory over time.",            tool: "Claude", type: "Chat",       level: "Intermediate", status: "Not Started", apps: ["Drive", "Docs", "PDF"],    collection: "Claude Essentials", isNew: true  },
  { title: "Build automated workflows with Claude Skills",desc: "Use the skill creator to build, test, and invoke a custom automation from the chat bar.",                      tool: "Claude", type: "Automation", level: "Intermediate", status: "Not Started", apps: ["Docs", "Email", "Sheets"], collection: "Claude Automation", isNew: true  },
  { title: "Automate Your Weekly Email Action Items",     desc: "Set up a weekly email check that categorises urgent and low-priority items automatically.",                    tool: "Claude", type: "Automation", level: "Intermediate", status: "Not Started", apps: ["Email", "Docs", "PDF"],    collection: "Claude Automation", isNew: false },
  { title: "Auto-Generate a Monthly Sales MIS Deck",     desc: "Upload a reference deck and dataset to build a skill that produces a branded report on demand.",               tool: "Claude", type: "Automation", level: "Advanced",      status: "Not Started", apps: ["XLSX", "Sheets", "CSV"],   collection: "Claude Automation", isNew: false },
  { title: "Add Specialist Domain Plugins",               desc: "Browse the plugin directory, activate a domain plugin, and run a skill using a slash command.",               tool: "Claude", type: "Chat",       level: "Intermediate", status: "Not Started", apps: ["Docs", "Email", "Sheets"], collection: "Claude Plugins",    isNew: false },
  { title: "Build and Publish an Interactive App with Artifacts", desc: "Use the Artifacts canvas to build, test, and publish a live interactive tool anyone can use.",        tool: "Claude", type: "Build",      level: "Intermediate", status: "Not Started", apps: ["Forms", "Sheets", "Docs"], collection: "Claude Build",      isNew: false },
  { title: "Set Up Claude Cowork on Your Desktop",        desc: "Configure Claude's local workspace so it can read, write, and manage files independently.",                   tool: "Claude", type: "Chat",       level: "Intermediate", status: "In Progress", apps: ["Docs", "Chat", "PDF"],     collection: "Claude Cowork",     isNew: false },
  { title: "Edit Real Files with Claude Cowork",          desc: "Use Claude Cowork to create & edit documents in a folder.",                                                   tool: "Claude", type: "Automation", level: "Intermediate", status: "In Progress", apps: ["Docs", "PDF", "Email"],    collection: "Claude Cowork",     isNew: false },
  { title: "Schedule Tasks to Run Automatically",         desc: "Set up a morning brief that pulls live calendar and email data every weekday at your chosen time.",           tool: "Claude", type: "Automation", level: "Advanced",      status: "Not Started", apps: ["Docs", "Email", "Sheets"], collection: "Claude Automation", isNew: false },
  { title: "Control Your Laptop from Anywhere with Dispatch", desc: "Learn how Dispatch links your devices so a mobile command can rewrite a file on your computer.",          tool: "Claude", type: "Automation", level: "Advanced",      status: "Not Started", apps: ["Forms", "Sheets", "Docs"], collection: "Claude Dispatch",   isNew: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APP_ICONS: Record<string, string> = {
  // Core
  Email: "✉️", Docs: "📄", Sheets: "📊", Drive: "📁", PDF: "🔖",
  Chat: "💬", Forms: "📝", XLSX: "📈", CSV: "📋",
  // Legacy / other tools
  Gmail: "📨", Folder: "🗂", Edit: "✏️", Brief: "📋", Notes: "📝",
  Insights: "💡", Ideas: "💡", Clock: "⏰", Tasks: "✅", App: "🧩",
  Data: "📊", Preview: "👁️", Prompt: "✨", Compare: "⚖️", Decision: "🧠",
  Excel: "📈", Charts: "📊", Dashboard: "📉", Owners: "👤", PPT: "📽️",
  Slides: "🖼️", Teams: "👥", Web: "🌐", Research: "🔎", Report: "📑",
  FAQs: "❓", Audio: "🎧", Summary: "🔊", Canvas: "🧱", Formula: "➗",
  Memory: "🧠", Images: "🖼️", Examples: "📚", Guardrails: "🛡️",
};

function appIcon(label: string) { return APP_ICONS[label] ?? "•"; }

function botClass(tool: string) {
  if (tool === "Claude")   return styles.botClaude;
  if (tool === "ChatGPT")  return styles.botChatgpt;
  if (tool === "Gemini")   return styles.botGemini;
  if (tool === "Copilot")  return styles.botCopilot;
  return styles.botAll;
}

function botLetter(tool: string) {
  if (tool === "Claude")  return "C";
  if (tool === "ChatGPT") return "G";
  if (tool === "Gemini")  return "G";
  if (tool === "Copilot") return "M";
  return "AI";
}

function typeDotClass(type: string) {
  if (type === "Automation") return styles.typeAutomation;
  if (type === "Build")      return styles.typeBuild;
  return styles.typeChat;
}

function toolDotClass(tool: string) {
  if (tool === "Claude")  return styles.dotClaude;
  if (tool === "ChatGPT") return styles.dotChatgpt;
  if (tool === "Gemini")  return styles.dotGemini;
  if (tool === "Copilot") return styles.dotCopilot;
  return styles.dotAll;
}

// ─── WorkflowCard ─────────────────────────────────────────────────────────────

function WorkflowCard({ w, onClick }: { w: Workflow; onClick: () => void }) {
  const showStatus = w.status === "In Progress" || w.status === "Completed" || w.isNew;
  return (
    <article className={styles.card} data-type={w.type} onClick={onClick}>
      <div className={styles.visual}>
        {showStatus && (
          <span className={styles.statusBadge}>
            {w.isNew ? "New" : w.status}
          </span>
        )}
        <div className={styles.flow}>
          {w.apps.slice(0, 4).map((a) => (
            <div key={a} className={styles.flowIcon} title={a}>
              {appIcon(a)}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.titleBlock}>
        <h3>{w.title}</h3>
        <p>{w.desc}</p>
      </div>
      <div className={styles.metaRow}>
        <div className={styles.botBadge}>
          <div className={`${styles.bot} ${botClass(w.tool)}`}>{botLetter(w.tool)}</div>
          {w.tool === "All" ? "Any chatbot" : w.tool}
        </div>
        <div className={styles.typeChip}>
          <span className={`${styles.typeDot} ${typeDotClass(w.type)}`} />
          {w.type}
        </div>
      </div>
    </article>
  );
}

// ─── SignupModal ───────────────────────────────────────────────────────────────

function SignupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Trial card */}
        <a
          href="https://aistudio.nudgeable.app/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="group block no-underline"
        >
          <div className="rounded-2xl border border-amber/30 bg-white shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="h-1 w-full bg-gradient-to-r from-amber via-norange to-transparent" />
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                <Hammer size={22} className="text-amber" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[2.5px] text-norange uppercase mb-1.5">
                  Free 7-Day Trial
                </p>
                <div className="text-base font-extrabold text-shadow mb-1">
                  Nudgeable AI Work Studio
                </div>
                <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">
                  Keep pace with practical AI workflows. Pick the AI tool you have, choose a work problem, and practice with guided screenshots and videos.
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 text-left w-full max-w-xs">
                {["New applications added every week", "Guided practice with real work problems"].map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-muted">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber/15 text-amber flex items-center justify-center shrink-0 text-[10px] font-black">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-1 px-6 py-2.5 rounded-full bg-amber text-shadow text-sm font-black group-hover:opacity-90 transition flex items-center gap-2">
                Start your free 7-day trial
                <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </a>

      </div>
    </div>
  );
}

// ─── CardsRow ─────────────────────────────────────────────────────────────────

function CardsRow({ list, onCardClick }: { list: Workflow[]; onCardClick: () => void }) {
  if (list.length === 0) return null;
  return (
    <div className={styles.cardsGrid}>
      {list.map((w) => (
        <WorkflowCard key={w.title} w={w} onClick={onCardClick} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkshopContent(_props: {
  isLoggedIn: boolean;
  needsCompany: boolean;
  displayName: string | null;
  companies: Company[];
}) {
  const [tool, setTool]       = useState("All");
  const [intent, setIntent]   = useState("All");
  const [status, setStatus]   = useState("All");
  const [search, setSearch]   = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const libraryRef = useRef<HTMLElement>(null);

  // ── Filtering ──
  const toolMatch  = (w: Workflow) => tool   === "All" || w.tool === tool   || w.tool === "All";
  const intentMatch= (w: Workflow) => intent === "All" || w.type === intent;
  const statusMatch= (w: Workflow) =>
    status === "All" ||
    w.status === status ||
    w.level  === status ||
    (status === "New" && w.isNew);
  const searchMatch= (w: Workflow) => {
    const q = search.trim().toLowerCase();
    return !q || [w.title, w.desc, w.tool, w.type, w.level, w.collection, ...w.apps]
      .join(" ").toLowerCase().includes(q);
  };

  const toolRelevant   = workflows.filter(toolMatch);
  const intentRelevant = toolRelevant.filter(intentMatch);
  const filtered       = intentRelevant.filter(statusMatch).filter(searchMatch);

  const newList      = intentRelevant.filter((w) => w.isNew).slice(0, 3);
  const continueList = intentRelevant.filter((w) => w.status === "In Progress").slice(0, 3);

  const scrollToLibrary = () =>
    libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openModal = () => setModalOpen(true);

  // ── Tool chips ──
  const toolChips = [
    { value: "All",     dot: styles.dotAll,     label: "All tools" },
    { value: "Claude",  dot: styles.dotClaude,  label: "Claude" },
    { value: "ChatGPT", dot: styles.dotChatgpt, label: "ChatGPT" },
    { value: "Gemini",  dot: styles.dotGemini,  label: "Gemini" },
    { value: "Copilot", dot: styles.dotCopilot, label: "Copilot" },
  ];

  const intents = [
    { value: "All",        icon: "✦", title: "All workflows",  desc: "Browse everything available for your AI tools." },
    { value: "Chat",       icon: "💬", title: "Chat",          desc: "Write, summarize, analyze, compare, and decide faster." },
    { value: "Automation", icon: "⚡", title: "Automate",      desc: "Save time on repetitive document, email, and follow-up tasks." },
    { value: "Build",      icon: "🛠", title: "Build",         desc: "Create apps, dashboards, tools, and reusable workflows." },
  ];

  const statusFilters = [
    "All", "Beginner", "Intermediate", "Advanced", "Not Started", "In Progress", "Completed", "New"
  ];

  const resultLabel = tool === "All" ? "all tools" : tool;

  return (
    <div className={styles.root}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.badge}>★ New applications added every week</div>
        <h1 className={styles.heroTitle}>Keep pace with practical AI workflows</h1>
        <p className={styles.heroDesc}>
          Pick the AI tool you have. Choose a work problem. Practice with guided screenshots and videos.
        </p>
        <div className={styles.searchRow}>
          <input
            type="search"
            placeholder="Search activities, tools, topics, or work problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" onClick={scrollToLibrary}>Search</button>
        </div>
      </section>

      {/* ── Selector panel ───────────────────────────────────── */}
      <section className={styles.selectorPanel}>
        <div className={styles.selectorHead}>
          <div>
            <h2 className={styles.selectorHeadTitle}>Start with your AI tool</h2>
            <div className={styles.smallNote}>Users see the most relevant workflows first, based on tool access.</div>
          </div>
          <div className={styles.smallNote}>{filtered.length} workflows for {resultLabel}</div>
        </div>

        <div className={styles.chipRow}>
          {toolChips.map((tc) => (
            <button
              key={tc.value}
              type="button"
              className={`${styles.chip} ${tool === tc.value ? styles.chipActive : ""}`}
              onClick={() => setTool(tc.value)}
            >
              <span className={`${styles.toolDot} ${tc.dot}`} />
              {tc.label}
            </button>
          ))}
        </div>

        <div className={styles.intentGrid}>
          {intents.map((it) => (
            <button
              key={it.value}
              type="button"
              className={`${styles.intent} ${intent === it.value ? styles.intentActive : ""}`}
              onClick={() => setIntent(it.value)}
            >
              <div className={styles.intentIcon}>{it.icon}</div>
              <h3 className={styles.intentTitle}>{it.title}</h3>
              <p className={styles.intentDesc}>{it.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Main layout ──────────────────────────────────────── */}
      <div className={styles.mainLayout}>
        <div>
          {/* New this week */}
          <section className={styles.sectionArea}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>New this week</h2>
                <p className={styles.sectionDesc}>Fresh workflows users can practice right away.</p>
              </div>
              <button type="button" className={styles.linkBtn} onClick={() => { setStatus("New"); scrollToLibrary(); }}>
                View all new
              </button>
            </div>
            <CardsRow
              list={newList.length ? newList : intentRelevant.slice(0, 3)}
              onCardClick={openModal}
            />
          </section>

          {/* Continue */}
          <section className={styles.sectionArea}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>Continue where you left off</h2>
                <p className={styles.sectionDesc}>Jump back into unfinished workflows.</p>
              </div>
              <button type="button" className={styles.linkBtn} onClick={() => { setStatus("In Progress"); scrollToLibrary(); }}>
                View in progress
              </button>
            </div>
            <CardsRow
              list={continueList.length ? continueList : toolRelevant.slice(0, 3)}
              onCardClick={openModal}
            />
          </section>

          {/* Full library */}
          <section className={styles.sectionArea} ref={libraryRef} id="library">
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>Full workflow library</h2>
                <p className={styles.sectionDesc}>Use filters when you want to browse everything.</p>
              </div>
            </div>

            <div className={styles.libraryShell}>
              <div className={styles.libraryFilters}>
                <div className={styles.chipRow}>
                  {toolChips.map((tc) => (
                    <button
                      key={tc.value}
                      type="button"
                      className={`${styles.chip} ${tool === tc.value ? styles.chipActive : ""}`}
                      onClick={() => setTool(tc.value)}
                    >
                      <span className={`${styles.toolDot} ${tc.dot}`} />
                      {tc.label}
                    </button>
                  ))}
                </div>
                <div className={styles.miniFilterLine}>
                  {statusFilters.map((sf) => (
                    <button
                      key={sf}
                      type="button"
                      className={`${styles.mini} ${status === sf ? styles.miniActive : ""}`}
                      onClick={() => setStatus(sf)}
                    >
                      {sf === "Not Started" ? "Not started" : sf === "In Progress" ? "In progress" : sf}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className={styles.cardsGrid}>
                  {filtered.map((w) => (
                    <WorkflowCard key={w.title} w={w} onClick={openModal} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No matching workflows. Try changing the tool, intent, or search term.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className={styles.side}>
          <section className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Your AI Work Pace</h3>
            <div className={styles.levelBox}>
              <div className={styles.levelLabel}>Current level</div>
              <div className={styles.levelRow}>
                <span className={styles.levelName}>Starter</span>
                <span className={styles.levelPts}>50 pts</span>
              </div>
              <div className={styles.meter}>
                <div className={styles.meterFill} />
              </div>
            </div>
            <div className={styles.statGrid}>
              <div className={styles.stat}><div className={styles.statLabel}>Completed</div><div className={styles.statNum}>{workflows.filter(w => w.status === "Completed").length}</div></div>
              <div className={styles.stat}><div className={styles.statLabel}>In progress</div><div className={styles.statNum}>{workflows.filter(w => w.status === "In Progress").length}</div></div>
              <div className={styles.stat}><div className={styles.statLabel}>New this week</div><div className={styles.statNum}>{workflows.filter(w => w.isNew).length}</div></div>
              <div className={styles.stat}><div className={styles.statLabel}>Available</div><div className={styles.statNum}>{workflows.length}</div></div>
            </div>
            <div className={styles.paceCallout}>
              Next level: complete 2 more workflows. You are keeping pace with the essentials.
            </div>
          </section>

          <section className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>This week in AI work</h3>
            <div className={styles.updates}>
              {[
                { icon: "C", title: "Claude Dispatch path is live",           sub: "Control your laptop remotely" },
                { icon: "C", title: "Claude Skills automation pack added",    sub: "3 new practice workflows" },
                { icon: "C", title: "Claude Cowork desktop workflows updated", sub: "File editing & task scheduling" },
              ].map((u) => (
                <div key={u.title} className={styles.update}>
                  <div className={styles.updateIcon}>{u.icon}</div>
                  <div>
                    <strong className={styles.updateTitle}>{u.title}</strong>
                    <span className={styles.updateSub}>{u.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* ── Signup modal ─────────────────────────────────────── */}
      {modalOpen && <SignupModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
