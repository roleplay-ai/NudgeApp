"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Trophy, ArrowLeft, RotateCcw, Zap, Clock, Lock } from "lucide-react";
import Link from "next/link";
import type { PracticeActivity, PracticeSession, PracticeMessage, PracticeScore } from "@/lib/types";

type EnrichedScore = PracticeScore & { name: string; max_score: number };

type View = "chat" | "results";

export default function PracticeChat({
  activity,
  initialSession,
  initialMessages,
  latestSubmitted,
  submittedScores,
  isLoggedIn = true,
}: {
  activity: PracticeActivity;
  initialSession: PracticeSession | null;
  initialMessages: PracticeMessage[];
  latestSubmitted: PracticeSession | null;
  submittedScores: EnrichedScore[];
  userId: string | null;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(
    initialMessages.map((m) => ({ role: m.role, content: m.content }))
  );
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<View>(latestSubmitted && !initialSession ? "results" : "chat");
  const [scores, setScores] = useState<EnrichedScore[]>(submittedScores);
  const [resultSession, setResultSession] = useState<PracticeSession | null>(latestSubmitted);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [xpDelta, setXpDelta] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    setError(null);

    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    const MAX_ATTEMPTS = 3;
    let attempt = 0;
    while (attempt < MAX_ATTEMPTS) {
      try {
        const body = isLoggedIn
          ? JSON.stringify({ sessionId, activityId: activity.id, message: msg })
          : JSON.stringify({ activityId: activity.id, message: msg, guestMessages: messages });

        const res = await fetch("/api/practice/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        const data = await res.json();

        if (res.status === 503 && attempt < MAX_ATTEMPTS - 1) {
          attempt++;
          setError(`AI is busy — retrying (${attempt}/${MAX_ATTEMPTS - 1})…`);
          await new Promise((r) => setTimeout(r, 3000 * attempt));
          continue;
        }

        if (!res.ok) throw new Error(data.error || "Failed to send");
        setError(null);
        if (isLoggedIn && !sessionId) setSessionId(data.sessionId);
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        break;
      } catch (err: any) {
        setError(err.message);
        setMessages((prev) => prev.slice(0, -1));
        setInput(msg);
        break;
      }
    }

    setSending(false);
    textareaRef.current?.focus();
  }

  async function handleSubmit() {
    if (messages.filter((m) => m.role === "user").length === 0) return;
    if (isLoggedIn && !sessionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = isLoggedIn
        ? JSON.stringify({ sessionId })
        : JSON.stringify({ activityId: activity.id, guestMessages: messages });

      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      const enriched: EnrichedScore[] = (data.scores || []).map((s: any) => ({
        ...s,
        name: s.rubric_name ?? s.name ?? "",
      }));
      setScores(enriched);
      setResultSession({ id: sessionId ?? "", total_score: data.totalScore, max_possible: data.maxPossible } as any);
      setXpEarned(data.xpEarned ?? null);
      setXpDelta(data.xpDelta ?? null);
      setView("results");
      if (isLoggedIn) router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startFresh() {
    setMessages([]);
    setSessionId(null);
    setScores([]);
    setResultSession(null);
    setXpEarned(null);
    setXpDelta(null);
    setView("chat");
    setError(null);
  }

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const totalScore = resultSession?.total_score ?? 0;
  const maxPossible = resultSession?.max_possible ?? scores.reduce((s, r) => s + r.max_score, 0);
  const pct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  // ── RESULTS VIEW ──
  if (view === "results") {
    return (
      <div>
        <div className="bg-homeInk rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">
                ASSESSMENT REPORT
              </span>
              <h2 className="text-2xl font-extrabold mt-3 mb-1">
                {pct >= 80 ? "Strong work" : pct >= 60 ? "Good effort" : "Keep practising"},{" "}
                let&rsquo;s review.
              </h2>
              <p className="text-sm text-white/70">
                You scored <strong className="text-white">{totalScore}/{maxPossible}</strong> on{" "}
                <em>{activity.name}</em>
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {isLoggedIn && xpEarned !== null && (
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-sm font-semibold">
                    <Zap size={13} className="text-homeClay" />
                    +{xpEarned} XP
                    {xpDelta !== null && xpDelta !== xpEarned && (
                      <span className={`ml-1 text-xs font-bold ${xpDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        ({xpDelta > 0 ? "+" : ""}{xpDelta})
                      </span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-sm font-semibold">
                  <Clock size={13} /> {activity.time_minutes} min planned
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-sm font-semibold">
                  {userMessageCount} prompts sent
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <ScoreCircle value={pct} size={96} />
            </div>
          </div>
        </div>

        {/* Guest login CTA */}
        {!isLoggedIn && (
          <div className="bg-white rounded-2xl border border-nborder p-6 mb-6 text-center">
            <div className="w-12 h-12 rounded-full bg-homeClay/10 flex items-center justify-center mx-auto mb-3">
              <Lock size={22} className="text-homeClay" />
            </div>
            <h3 className="font-extrabold text-homeInk text-lg mb-1">See your full results</h3>
            <p className="text-sm text-homeBodyMuted mb-4 max-w-sm mx-auto">
              Log in to unlock the detailed score breakdown, per-criteria feedback, and track your progress over time.
            </p>
            <Link
              href={`/login?redirect=/practice/${activity.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-homeClay text-white rounded-xl font-bold text-sm hover:bg-homeClay/90 transition"
            >
              Log in to see full results
            </Link>
          </div>
        )}

        {/* Score breakdown */}
        {isLoggedIn && scores.length > 0 && (
          <div className="bg-white rounded-2xl border border-nborder p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-homeInk text-lg">Score breakdown</h3>
              <span className="text-sm text-homeBodyMuted font-semibold">
                {scores.length} criteria · {totalScore}/{maxPossible}
              </span>
            </div>
            <div className="space-y-6">
              {scores.map((score, i) => {
                const scorePct = score.max_score > 0 ? (score.score / score.max_score) * 100 : 0;
                const barColor = scorePct >= 80 ? "#22c55e" : scorePct >= 55 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={score.rubric_id ?? i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-homeInk">{score.name}</span>
                      <span className="font-bold text-homeInk tabular-nums">
                        {score.score}/{score.max_score}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${scorePct}%`, backgroundColor: barColor }}
                      />
                    </div>
                    {score.feedback && <p className="text-sm text-muted">{score.feedback}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={startFresh}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-nborder rounded-xl font-bold text-homeInk hover:bg-homeDivider transition text-sm"
          >
            <RotateCcw size={15} /> Try again
          </button>
          <Link
            href="/practice"
            className="flex items-center gap-2 px-5 py-3 bg-homeClay text-white rounded-xl font-bold hover:bg-homeClay/90 transition text-sm"
          >
            <ArrowLeft size={15} /> Back to activities
          </Link>
        </div>
      </div>
    );
  }

  // ── CHAT VIEW ──
  return (
    <div>
      <div className="rounded-2xl border border-nborder p-5 mb-6 flex items-center gap-4"
        style={{ backgroundColor: `${activity.color}0d`, borderColor: `${activity.color}30` }}>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
          style={{ backgroundColor: activity.color }}
        >
          {activity.icon}
        </div>
        <div>
          <div className="text-[10px] font-black tracking-[1.5px] uppercase mb-0.5" style={{ color: activity.color }}>
            {activity.category}
          </div>
          <h1 className="text-xl font-extrabold text-homeInk leading-tight">{activity.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-homeBodyMuted">
            <span className="flex items-center gap-1"><Clock size={11} /> {activity.time_minutes} min</span>
            {isLoggedIn && (
              <span className="flex items-center gap-1 font-semibold text-homeClay"><Zap size={11} /> +{activity.xp_reward} XP</span>
            )}
            <span>{activity.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Left panel: brief */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-nborder p-5">
            <div className="text-[10px] font-black tracking-[1.5px] text-homeBodyMuted mb-2">THE BRIEF</div>
            <h3 className="font-bold text-homeInk mb-2">What you&rsquo;re solving</h3>
            {/* select-none + onCopy blocked to prevent copying the brief */}
            <p
              className="text-sm text-homeBodyMuted leading-relaxed select-none"
              onCopy={(e) => e.preventDefault()}
            >
              {activity.description}
            </p>
          </div>

          {/* Submit for assessment */}
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(192,123,58,0.08)", borderColor: "rgba(192,123,58,0.28)" }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <Trophy size={20} className="shrink-0 mt-0.5 text-homeClay" />
                <div>
                  <div className="font-bold text-homeInk text-sm">Submit for assessment</div>
                  <div className="text-xs text-homeBodyMuted mt-0.5">
                    {userMessageCount === 0
                      ? "Send one or more prompts, then submit when ready."
                      : isLoggedIn
                        ? "All your prompts will be assessed together as a combined submission."
                        : "All prompts assessed together. Log in afterwards to save results & earn XP."}
                  </div>
                </div>
              </div>
              {userMessageCount > 0 && (
                <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-homeClay/15 text-homeClay border border-homeClay/20">
                  {userMessageCount} prompt{userMessageCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || userMessageCount === 0}
              className="w-full bg-homeClay text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-homeClay/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Assessing…"
                : userMessageCount === 0
                  ? "Send at least one prompt first"
                  : `Submit ${userMessageCount} prompt${userMessageCount !== 1 ? "s" : ""} for assessment →`}
            </button>
          </div>

          {!isLoggedIn && (
            <div className="rounded-2xl border p-4" style={{ backgroundColor: "rgba(192,123,58,0.06)", borderColor: "rgba(192,123,58,0.25)" }}>
              <p className="text-xs text-homeBodyMuted font-semibold mb-2">
                You&apos;re practising as a guest. Log in to save your results and earn XP.
              </p>
              <Link
                href={`/login?redirect=/practice/${activity.id}`}
                className="text-xs font-bold text-homeClay hover:underline"
              >
                Log in →
              </Link>
            </div>
          )}
        </div>

        {/* Right panel: AI Coach chat */}
        <div className="flex flex-col">
          <div className="bg-homeInk rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 520 }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-homeClay flex items-center justify-center text-white font-black text-sm">
                  +
                </div>
                <div>
                  <div className="text-white font-bold text-sm">AI Coach</div>
                  <div className="text-white/50 text-[10px] font-semibold tracking-wide">HERE TO ASSIST YOU</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 420 }}>
              {messages.length === 0 && (
                <div className="bg-white/10 rounded-2xl p-4 text-white text-sm max-w-[85%]">
                  Hi! I&apos;m your AI Coach — here to assist you. What can I help you with?
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-homeClay text-white font-medium"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl px-4 py-3 text-white/60 text-sm">
                    <span className="animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {activity.hint_chips?.length > 0 && messages.length === 0 && (
              <div className="px-5 py-2 flex flex-wrap gap-2 border-t border-white/10">
                {activity.hint_chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    className="px-3 py-1 rounded-full border border-white/20 text-white/70 text-xs font-semibold hover:border-white/40 hover:text-white transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div className="px-4 py-3 border-t border-white/10">
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your prompt… (pasting is disabled)"
                  className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-1 focus:ring-homeClay/60 transition"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-homeClay text-white rounded-xl font-bold text-sm hover:bg-homeClay/90 transition disabled:opacity-50 shrink-0"
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ScoreCircle({ value, size = 96 }: { value: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const stroke = circ - (value / 100) * circ;
  const color = value >= 80 ? "#22c55e" : value >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={stroke}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{value}</span>
        <span className="text-[10px] text-white/50 font-bold">OUT OF 100</span>
      </div>
    </div>
  );
}
