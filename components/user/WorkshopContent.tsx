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
  { title: "Automate repeated Gmail tasks", desc: "Create a repeatable workflow for email drafts, follow-ups, and replies.", tool: "Claude", type: "Automation", level: "Intermediate", status: "In Progress", apps: ["Email", "Docs", "Gmail"], collection: "Claude Automation", isNew: true },
  { title: "Create and edit folder documents", desc: "Build a workflow to create and revise docs directly from a shared folder.", tool: "Claude", type: "Automation", level: "Intermediate", status: "In Progress", apps: ["Folder", "Docs", "Edit"], collection: "Claude Automation", isNew: false },
  { title: "Create a project brief", desc: "Build a structured brief from scattered notes and rough points.", tool: "ChatGPT", type: "Chat", level: "Beginner", status: "Not Started", apps: ["Docs", "Brief", "Notes"], collection: "ChatGPT for Work", isNew: false },
  { title: "Analyze survey comments", desc: "Group open comments into themes and build a quick insight summary.", tool: "ChatGPT", type: "Chat", level: "Intermediate", status: "Not Started", apps: ["Sheets", "Insights", "Ideas"], collection: "ChatGPT for Work", isNew: true },
  { title: "Schedule automated workflows", desc: "Build a recurring workflow that runs on a set schedule and sends updates.", tool: "Claude", type: "Automation", level: "Advanced", status: "Not Started", apps: ["Clock", "Email", "Docs", "Tasks"], collection: "Claude Automation", isNew: true },
  { title: "Build apps with Artifacts", desc: "Create a lightweight tool or mini app for a repeatable team use case.", tool: "Claude", type: "Build", level: "Intermediate", status: "In Progress", apps: ["App", "Data", "Preview"], collection: "Claude Build", isNew: false },
  { title: "Pick the right Claude model", desc: "Learn which model to use for quick work, reasoning, or heavy tasks.", tool: "Claude", type: "Chat", level: "Beginner", status: "In Progress", apps: ["Prompt", "Compare", "Decision"], collection: "Claude Essentials", isNew: false },
  { title: "Turn raw data into dashboards", desc: "Build a dashboard workflow that converts spreadsheet data into chart ideas.", tool: "Claude", type: "Build", level: "Advanced", status: "Not Started", apps: ["Excel", "Charts", "Dashboard"], collection: "Claude Build", isNew: false },
  { title: "Find action items from email", desc: "Build a faster way to extract tasks, owners, and next steps from inbox threads.", tool: "Claude", type: "Chat", level: "Intermediate", status: "Not Started", apps: ["Email", "Tasks", "Owners"], collection: "Claude Essentials", isNew: true },
  { title: "Analyze Excel data", desc: "Turn spreadsheet questions into fast insights and chart suggestions.", tool: "Copilot", type: "Chat", level: "Intermediate", status: "Not Started", apps: ["Excel", "Charts", "Insights"], collection: "Copilot Office Work", isNew: false },
  { title: "Draft a presentation in PowerPoint", desc: "Create a deck draft from a rough outline using Copilot.", tool: "Copilot", type: "Chat", level: "Beginner", status: "Not Started", apps: ["PPT", "Slides", "Docs"], collection: "Copilot Office Work", isNew: false },
  { title: "Summarize Teams meetings", desc: "Build a quick meeting recap workflow with actions and decisions.", tool: "Copilot", type: "Automation", level: "Beginner", status: "Not Started", apps: ["Teams", "Tasks", "Docs"], collection: "Copilot Office Work", isNew: true },
  { title: "Research faster with Deep Research", desc: "Build a structured research workflow from one broad business question.", tool: "Gemini", type: "Chat", level: "Intermediate", status: "Not Started", apps: ["Web", "Research", "Report"], collection: "Gemini Research", isNew: true },
  { title: "Use NotebookLM for synthesis", desc: "Turn multiple source documents into grounded summaries and FAQs.", tool: "Gemini", type: "Chat", level: "Beginner", status: "Not Started", apps: ["Docs", "Notes", "FAQs"], collection: "Gemini Research", isNew: true },
  { title: "Create a podcast-style summary", desc: "Build an audio-style summary flow from uploaded source material.", tool: "Gemini", type: "Build", level: "Beginner", status: "Not Started", apps: ["Audio", "Docs", "Summary"], collection: "Gemini Research", isNew: false },
  { title: "Build a simple calculator", desc: "Create a lightweight work calculator using Canvas.", tool: "ChatGPT", type: "Build", level: "Intermediate", status: "Not Started", apps: ["Canvas", "Data", "Formula"], collection: "ChatGPT Build", isNew: false },
  { title: "Use Projects for recurring work", desc: "Set up a reusable project space for a workstream you repeat often.", tool: "ChatGPT", type: "Automation", level: "Beginner", status: "Not Started", apps: ["Folder", "Prompt", "Memory"], collection: "ChatGPT for Work", isNew: false },
  { title: "Create a visual campaign idea", desc: "Build a prompt workflow for campaign concepts and image directions.", tool: "All", type: "Build", level: "Intermediate", status: "Not Started", apps: ["Images", "Docs", "Ideas"], collection: "Cross Tool Workflows", isNew: false },
  { title: "Write better prompts with RIEG", desc: "Build a simple prompting method using role, instructions, examples, and guardrails.", tool: "All", type: "Chat", level: "Beginner", status: "Not Started", apps: ["Prompt", "Examples", "Guardrails"], collection: "Cross Tool Workflows", isNew: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APP_ICONS: Record<string, string> = {
  Email: "✉️", Docs: "📄", Gmail: "📨", Folder: "🗂", Edit: "✏️", Brief: "📋",
  Notes: "📝", Sheets: "📊", Insights: "💡", Ideas: "💡", Clock: "⏰", Tasks: "✅",
  App: "🧩", Data: "📊", Preview: "👁️", Prompt: "✨", Compare: "⚖️", Decision: "🧠",
  Excel: "📈", Charts: "📊", Dashboard: "📉", Owners: "👤", PPT: "📽️", Slides: "🖼️",
  Teams: "👥", Web: "🌐", Research: "🔎", Report: "📑", FAQs: "❓", Audio: "🎧",
  Summary: "🔊", Canvas: "🧱", Formula: "➗", Memory: "🧠", Images: "🖼️",
  Examples: "📚", Guardrails: "🛡️",
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
              <div className={styles.stat}><div className={styles.statLabel}>Completed</div><div className={styles.statNum}>1</div></div>
              <div className={styles.stat}><div className={styles.statLabel}>In progress</div><div className={styles.statNum}>3</div></div>
              <div className={styles.stat}><div className={styles.statLabel}>New this week</div><div className={styles.statNum}>5</div></div>
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
                { icon: "C", title: "Claude Skills starter pack added", sub: "3 new practice workflows" },
                { icon: "G", title: "Gemini NotebookLM path is live",   sub: "Research and synthesis workflows" },
                { icon: "M", title: "Copilot Office workflows updated",  sub: "Excel, PowerPoint, and Teams" },
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
