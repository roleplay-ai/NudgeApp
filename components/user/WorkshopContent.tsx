"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookMarked,
  Brain,
  ChevronDown,
  CircuitBoard,
  Clock,
  ExternalLink,
  FlaskConical,
  FolderOpen,
  Hammer,
  Lightbulb,
  Lock,
  PenLine,
  TrendingUp,
} from "lucide-react";
import type { Company } from "@/lib/types";
import { saveCompanyAction } from "@/app/actions/saveCompanyAction";

const CARDS = [
  {
    id: "quizzes",
    Icon: Brain,
    title: "Quizzes",
    desc: "Quick-fire questions across GenAI foundations, prompting, and real-world AI use cases.",
    tag: "Quiz",
    duration: "5–10 min",
    accent: "#F68A29",
    href: "/practice?tab=quiz",
    external: false,
  },
  {
    id: "prompt",
    Icon: PenLine,
    title: "Prompt Assessment",
    desc: "Write prompts for real tasks and get scored on clarity, structure, and output quality.",
    tag: "Assessment",
    duration: "10–20 min",
    accent: "#623CEA",
    href: "/practice?tab=prompts",
    external: false,
  },
  {
    id: "agent",
    Icon: CircuitBoard,
    title: "AI Agent & Automation Design",
    desc: "Design and build live AI agents and automations in a guided, end-to-end building session.",
    tag: "Hands-on",
    duration: "30–45 min",
    accent: "#3696FC",
    href: "https://build-session.vercel.app",
    external: true,
  },
  {
    id: "cab",
    Icon: TrendingUp,
    title: "CAB Ladder",
    desc: "Conversation, Automation, Building — find out where you sit on the AI competency ladder.",
    tag: "Progression",
    duration: "5 min",
    accent: "#23CE68",
    href: "https://playbook-nudgeable.vercel.app/cab-diagnostic",
    external: true,
  },
  {
    id: "fitTest",
    Icon: FlaskConical,
    title: "AI Fit Test",
    desc: "Test your ability to judge where GenAI adds real value — and where it's better left out.",
    tag: "Assessment",
    duration: "10 min",
    accent: "#ED4551",
    href: "https://playbook-nudgeable.vercel.app/ai-fit-test",
    external: true,
  },
  {
    id: "opportunity",
    Icon: Lightbulb,
    title: "AI Opportunity Plan",
    desc: "Map out where AI can save time, cut effort, and create real value inside your daily work.",
    tag: "Planning",
    duration: "15–20 min",
    accent: "#A855F7",
    href: "https://playbook-nudgeable.vercel.app/activities",
    external: true,
  },
  {
    id: "resources",
    Icon: BookMarked,
    title: "Further Learning",
    desc: "Curated guides, templates, and references to support every stage of your AI learning journey.",
    tag: "Resources",
    duration: "Self-paced",
    accent: "#00BcB4",
    href: "/learn?tab=resources",
    external: false,
  },
  {
    id: "files",
    Icon: FolderOpen,
    title: "Practice Files",
    desc: "All datasets, templates, and worksheets for the workshop activities — in one shared folder.",
    tag: "Coming Soon",
    duration: null,
    accent: "#9e8e7a",
    href: null,
    external: false,
  },
] as const;

function WorkshopCard({ card }: { card: typeof CARDS[number] }) {
  const { Icon, title, desc, tag, duration, accent, href, external } = card;
  const isComingSoon = href === null;

  const inner = (
    <div className="relative rounded-2xl border border-nborder bg-white shadow-sm overflow-hidden flex flex-col transition-all duration-200 h-full">
      {/* Accent strip */}
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: isComingSoon
            ? "rgba(34,29,35,0.07)"
            : `linear-gradient(90deg, ${accent}, ${accent}55, transparent)`,
        }}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isComingSoon ? "rgba(34,29,35,0.06)" : `${accent}15`,
            color: isComingSoon ? "#9e8e7a" : accent,
          }}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>

        {/* Title */}
        <div
          className={`text-sm font-extrabold leading-snug ${isComingSoon ? "text-muted" : "text-shadow"}`}
        >
          {title}
        </div>

        {/* Description */}
        <p className="text-[12.5px] text-muted leading-relaxed flex-1">{desc}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
              style={{
                background: isComingSoon ? "rgba(34,29,35,0.05)" : `${accent}12`,
                color: isComingSoon ? "#9e8e7a" : accent,
                borderColor: isComingSoon ? "rgba(34,29,35,0.10)" : `${accent}28`,
              }}
            >
              {tag}
            </span>
            {duration && (
              <span className="text-[10px] text-muted flex items-center gap-1">
                <Clock size={10} strokeWidth={2} />
                {duration}
              </span>
            )}
          </div>
          {!isComingSoon && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity"
              style={{ background: `${accent}12`, color: accent }}
            >
              {external ? (
                <ExternalLink size={12} strokeWidth={2.5} />
              ) : (
                <ArrowRight size={12} strokeWidth={2.5} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isComingSoon) {
    return <div className="opacity-50 cursor-default h-full">{inner}</div>;
  }
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full hover:-translate-y-0.5 transition-transform duration-150 [&>div]:hover:shadow-md"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="group block h-full hover:-translate-y-0.5 transition-transform duration-150 [&>div]:hover:shadow-md"
    >
      {inner}
    </Link>
  );
}

export default function WorkshopContent({
  isLoggedIn,
  needsCompany,
  displayName,
  companies,
}: {
  isLoggedIn: boolean;
  needsCompany: boolean;
  displayName: string | null;
  companies: Company[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(needsCompany);
  const [companyId, setCompanyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!companyId) return;
    setSaving(true);
    setSaveError(null);
    const result = await saveCompanyAction(companyId);
    setSaving(false);
    if (result.success) {
      setShowModal(false);
      router.refresh();
    } else {
      setSaveError(result.error ?? "Something went wrong.");
    }
  }

  if (!isLoggedIn) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black tracking-[3px] text-norange bg-norange/10 px-2.5 py-1 rounded-full border border-norange/20">
            WORKSHOP
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">
          Your AI Practice{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Arena</span>
            <span className="absolute -bottom-0.5 left-0 right-0 h-2.5 bg-amber/30 rounded-sm -z-0" />
          </span>
        </h1>
        <p className="text-sm text-muted mb-7 max-w-2xl">
          Apply what you learned. Get scored. Level up.
        </p>

        <div className="rounded-2xl border border-nborder bg-white shadow-sm p-10 flex flex-col items-center text-center gap-4 max-w-md mx-auto mt-8">
          <div className="w-14 h-14 rounded-2xl bg-norange/10 border border-norange/20 flex items-center justify-center">
            <Lock size={24} className="text-norange" strokeWidth={2} />
          </div>
          <div>
            <div className="text-base font-extrabold text-shadow mb-1">Log in to access the Workshop</div>
            <p className="text-sm text-muted leading-relaxed">
              Workshop modules are available to logged-in users. Sign in to unlock quizzes, assessments, and hands-on activities.
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <a
              href="/login"
              className="px-5 py-2.5 rounded-full bg-amber text-shadow text-sm font-black hover:opacity-90 transition"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="px-5 py-2.5 rounded-full border border-nborder text-shadow text-sm font-semibold hover:bg-chiffon transition"
            >
              Sign up free
            </a>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
            {[Brain, PenLine, CircuitBoard, TrendingUp, FlaskConical, Lightbulb, BookMarked, Hammer].map(
              (Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-lg bg-shadow/5 border border-nborder flex items-center justify-center text-muted/50">
                  <Icon size={14} strokeWidth={1.5} />
                </div>
              )
            )}
          </div>
          <p className="text-[11px] text-muted">8 modules · quizzes, assessments &amp; hands-on activities</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Company picker modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && !saving) setShowModal(false); }}
        >
          <div
            className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-2xl border border-nborder flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5 border-b border-nborder">
              <span className="text-[10px] font-black tracking-[2.5px] text-norange uppercase">
                One more step
              </span>
              <h2 className="text-xl font-extrabold text-shadow mt-1">
                Select your organisation
              </h2>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                {displayName ? `Welcome, ${displayName}! ` : ""}
                Choose your company to access your workshop modules.
              </p>
            </div>

            <div className="px-6 py-5">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wide mb-2">
                Your Organisation
              </label>
              <div className="relative">
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-white border border-nborder rounded-xl text-sm font-medium text-shadow outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber/60 transition"
                  style={{ fontFamily: "inherit" }}
                >
                  <option value="">Choose your organisation</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted"
                />
              </div>
              {saveError && (
                <p className="text-red-500 text-xs mt-2">{saveError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-nborder bg-bg/60">
              <button
                type="button"
                onClick={handleSave}
                disabled={!companyId || saving}
                className="px-6 py-2.5 rounded-full bg-amber text-shadow text-sm font-black transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Enter Workshop →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black tracking-[3px] text-norange bg-norange/10 px-2.5 py-1 rounded-full border border-norange/20">
            WORKSHOP
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">
          Your AI Practice{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Arena</span>
            <span className="absolute -bottom-0.5 left-0 right-0 h-2.5 bg-amber/30 rounded-sm -z-0" />
          </span>
        </h1>
        <p className="text-sm text-muted mb-7 max-w-2xl">
          Apply what you learned. Get scored. Level up.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CARDS.map((card) => (
            <WorkshopCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </>
  );
}
