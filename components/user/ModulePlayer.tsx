"use client";

import { useRef, useState } from "react";
import { Check, ChevronLeft, Lightbulb, Sparkles, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Module, ModuleScreen } from "@/lib/types";
import { awardPointsAction } from "@/app/actions/awardPointsAction";

/** Default XP for a completed module — must match point_rules seed in migration_026. */
const MODULE_DEFAULT_POINTS = 50;

interface Props {
  module: Module;
  screens: ModuleScreen[];
  onClose?: () => void;
  onComplete?: (moduleId: string) => void;
}

// Per screen-type accent palette
const SCREEN_ACCENT: Record<string, { color: string; bg: string; label: string }> = {
  hook:     { color: "#FFCE00", bg: "rgba(255,206,0,0.10)",   label: "HOOK" },
  idea:     { color: "#623CEA", bg: "rgba(98,60,234,0.09)",   label: "THE IDEA" },
  example:  { color: "#F68A29", bg: "rgba(246,138,41,0.09)",  label: "EXAMPLE" },
  why:      { color: "#3699FC", bg: "rgba(54,153,252,0.09)",  label: "WHY IT MATTERS" },
  check:    { color: "#23CE6B", bg: "rgba(35,206,107,0.09)",  label: "KNOWLEDGE CHECK" },
  unlocked: { color: "#FFCE00", bg: "rgba(255,206,0,0.10)",   label: "COMPLETE" },
};

export default function ModulePlayer({ module: mod, screens, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);

  const router = useRouter();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const total = screens.length;

  async function next() {
    if (step >= total - 1) {
      if (!finishing) {
        setFinishing(true);
        try {
          const result = await awardPointsAction({
            sourceType: "module",
            sourceId: mod.id,
            pointsAward: mod.points_award,
            defaultPoints: MODULE_DEFAULT_POINTS,
          });
          if (!result.success && result.error !== "Not authenticated") {
            console.error("[ModulePlayer] award_points failed:", result.error);
          }
          router.refresh();
          onComplete?.(mod.id);
        } finally {
          setFinishing(false);
        }
      }
      if (onClose) { onClose(); } else { window.location.href = "/learn"; }
      return;
    }
    setAnswer(null);
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    setAnswer(null);
    setStep((s) => s - 1);
  }

  function handleClose() {
    if (onClose) { onClose(); } else { window.location.href = "/learn"; }
  }

  // Guard: empty module
  if (total === 0) {
    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-lg rounded-2xl flex flex-col items-center justify-center py-16 gap-4"
          style={{ background: "#ffffff", border: "1px solid rgba(34,29,35,0.10)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-muted">This module has no screens yet.</p>
          <button type="button" onClick={handleClose}
            className="px-6 py-2.5 rounded-full bg-shadow text-white text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const screen = screens[step];
  const isUnlocked = screen.screen_type === "unlocked";
  const isLast = step === total - 1;
  const options = screen.screen_options?.map((o) => o.option_text) ?? [];
  const correctIndex = screen.screen_options?.findIndex((o) => o.is_correct) ?? -1;
  const isCheckLocked = screen.screen_type === "check" && answer === null;
  const tokens = screen.screen_tokens?.map((t) => ({ text: t.token_text, style: t.style })) ?? [];

  const accent = SCREEN_ACCENT[screen.screen_type] ?? SCREEN_ACCENT.hook;

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) * 1.4) return;
    if (Math.abs(dx) < 48) return;
    if (dx < 0 && !isCheckLocked) next();
    else if (dx > 0 && step > 0) back();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 bg-black/65 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl flex flex-col select-none overflow-hidden"
        style={{
          background: isUnlocked ? "#1c1814" : "#ffffff",
          maxHeight: "88vh",
          boxShadow: "0 28px 72px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)",
          border: isUnlocked ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(34,29,35,0.09)",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Colored accent strip ── */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{ background: `linear-gradient(90deg, ${accent.color}, ${accent.color}55, transparent)` }}
        />

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 pt-3.5 pb-3 flex-shrink-0">
          <button
            type="button"
            onClick={step > 0 ? back : handleClose}
            className="rounded-full p-1.5 transition hover:bg-black/6"
            style={{ color: isUnlocked ? "rgba(245,240,216,0.45)" : "#9e8e7a" }}
            aria-label={step > 0 ? "Previous" : "Close"}
          >
            {step > 0 ? <ChevronLeft size={20} /> : <X size={20} />}
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? "22px" : "8px",
                  background:
                    i < step
                      ? "#623CEA"
                      : i === step
                      ? accent.color
                      : isUnlocked
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(34,29,35,0.10)",
                }}
              />
            ))}
          </div>

          <div
            className="text-[11px] font-bold tabular-nums w-10 text-right"
            style={{ color: isUnlocked ? "rgba(245,240,216,0.40)" : "#b0a090" }}
          >
            {step + 1}/{total}
          </div>
        </div>

        {/* ── Screen type badge ── */}
        <div className="px-5 pb-3 flex-shrink-0">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.18em] px-2.5 py-1 rounded-full"
            style={{
              background: isUnlocked ? "rgba(255,206,0,0.15)" : accent.bg,
              color: isUnlocked ? "#FFCE00" : accent.color,
              border: `1px solid ${accent.color}30`,
            }}
          >
            {screen.screen_type === "hook"     && <Sparkles size={9} strokeWidth={2.5} />}
            {screen.screen_type === "idea"     && <Lightbulb size={9} strokeWidth={2.5} />}
            {screen.screen_type === "check"    && <Zap size={9} strokeWidth={2.5} />}
            {screen.screen_type === "unlocked" && <Check size={9} strokeWidth={3} />}
            {screen.label?.toUpperCase() || accent.label}
          </span>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ minHeight: 0 }}>

          {/* ── HOOK ──────────────────────────────── */}
          {screen.screen_type === "hook" && (
            <div className="flex flex-col gap-4">
              {/* Amber accent block */}
              <div
                className="rounded-2xl px-5 py-5"
                style={{ background: "linear-gradient(135deg, rgba(255,206,0,0.12) 0%, rgba(255,206,0,0.04) 100%)", border: "1px solid rgba(255,206,0,0.20)" }}
              >
                <h2 className="text-xl font-extrabold leading-snug text-shadow">
                  {screen.title}
                </h2>
              </div>
              {screen.body && (
                <p className="text-sm text-muted leading-relaxed px-1">{screen.body}</p>
              )}
            </div>
          )}

          {/* ── IDEA ──────────────────────────────── */}
          {screen.screen_type === "idea" && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl px-5 py-5"
                style={{ background: "rgba(98,60,234,0.06)", border: "1px solid rgba(98,60,234,0.15)", borderLeft: "4px solid #623CEA" }}
              >
                <h2 className="text-xl font-extrabold leading-snug text-shadow">
                  {screen.title}
                </h2>
              </div>
              {screen.body && (
                <p className="text-sm leading-relaxed px-1" style={{ color: "#4A4047" }}>{screen.body}</p>
              )}
            </div>
          )}

          {/* ── EXAMPLE ───────────────────────────── */}
          {screen.screen_type === "example" && (
            <div className="flex flex-col gap-4">
              {screen.title && (
                <h2 className="text-base font-bold text-shadow">{screen.title}</h2>
              )}
              {screen.body && (() => {
                const tone = screen.tone || "neutral";
                const cfg = tone === "bad"
                  ? { bg: "#FEF0EE", border: "#ED4551", label: "❌ Bad example", labelColor: "#8C1C24", bodyColor: "#3a1010" }
                  : tone === "good"
                  ? { bg: "#EDFBF3", border: "#23CE6B", label: "✅ Good example", labelColor: "#0A6632", bodyColor: "#0a2a15" }
                  : { bg: "#FFF8ED", border: "#F68A29", label: "📋 Example", labelColor: "#7A3A00", bodyColor: "#221D23" };
                return (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: `1.5px solid ${cfg.border}40` }}
                  >
                    {/* Tone header */}
                    <div
                      className="px-4 py-2 flex items-center gap-2"
                      style={{ background: `${cfg.border}14` }}
                    >
                      <span className="text-[11px] font-black tracking-wide" style={{ color: cfg.labelColor }}>
                        {screen.label?.toUpperCase() || cfg.label}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="px-4 py-3.5" style={{ background: cfg.bg }}>
                      <p className="text-sm font-medium leading-snug" style={{ color: cfg.bodyColor }}>
                        {screen.body}
                      </p>
                      {tokens.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tokens.map((tk, j) => (
                            <span
                              key={j}
                              className="inline-block rounded-lg px-2.5 py-1 text-xs font-semibold"
                              style={
                                tk.style === "highlight"
                                  ? { background: "#EEEDFE", color: "#3C3489" }
                                  : tk.style === "dimmed"
                                  ? { background: "rgba(0,0,0,0.08)", color: "#9e8e7a" }
                                  : { background: "rgba(34,29,35,0.08)", color: "#221D23" }
                              }
                            >
                              {tk.text}
                            </span>
                          ))}
                          <div className="w-full text-[10px] text-muted mt-1 font-medium">
                            Phrases worth noticing
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── WHY ───────────────────────────────── */}
          {screen.screen_type === "why" && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl px-5 py-5"
                style={{ background: "rgba(54,153,252,0.07)", border: "1px solid rgba(54,153,252,0.18)", borderLeft: "4px solid #3699FC" }}
              >
                <h2 className="text-xl font-extrabold leading-snug text-shadow">
                  {screen.title}
                </h2>
              </div>
              {screen.body && (
                <p className="text-sm leading-relaxed px-1" style={{ color: "#4A4047" }}>{screen.body}</p>
              )}
            </div>
          )}

          {/* ── CHECK ─────────────────────────────── */}
          {screen.screen_type === "check" && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl px-4 py-4"
                style={{ background: "rgba(35,206,107,0.07)", border: "1px solid rgba(35,206,107,0.20)" }}
              >
                <p className="text-base font-bold text-shadow leading-snug">{screen.question}</p>
              </div>

              <div className="flex flex-col gap-2">
                {options.map((opt, i) => {
                  const sel = answer === i;
                  const correct = i === correctIndex;
                  const reveal = answer !== null;

                  let style: React.CSSProperties = {
                    background: "#FAFAF8",
                    border: "1.5px solid rgba(34,29,35,0.12)",
                    color: "#221D23",
                  };
                  let letterStyle: React.CSSProperties = {
                    background: "rgba(34,29,35,0.07)",
                    color: "#6B6B6B",
                  };

                  if (sel && !reveal) {
                    style = { background: "#EEEDFE", border: "1.5px solid #623CEA", color: "#3C3489" };
                    letterStyle = { background: "#623CEA", color: "#fff" };
                  }
                  if (reveal && correct) {
                    style = { background: "#EDFBF3", border: "1.5px solid #23CE6B", color: "#0A6632" };
                    letterStyle = { background: "#23CE6B", color: "#fff" };
                  }
                  if (reveal && sel && !correct) {
                    style = { background: "#FEF0EE", border: "1.5px solid #ED4551", color: "#8C1C24" };
                    letterStyle = { background: "#ED4551", color: "#fff" };
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => answer === null && setAnswer(i)}
                      className="text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
                      style={{ ...style, cursor: reveal ? "default" : "pointer" }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-all"
                        style={letterStyle}
                      >
                        {reveal && correct
                          ? <Check size={13} strokeWidth={3} />
                          : String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {answer !== null && (
                <div
                  className="rounded-xl px-4 py-3 text-xs leading-relaxed font-medium"
                  style={
                    answer === correctIndex
                      ? { background: "rgba(35,206,107,0.10)", color: "#0A6632", border: "1px solid rgba(35,206,107,0.25)" }
                      : { background: "rgba(237,69,81,0.08)", color: "#8C1C24", border: "1px solid rgba(237,69,81,0.20)" }
                  }
                >
                  {answer === correctIndex
                    ? `✓ ${screen.feedback_correct}`
                    : `✗ ${screen.feedback_incorrect}`}
                </div>
              )}
            </div>
          )}

          {/* ── UNLOCKED ──────────────────────────── */}
          {screen.screen_type === "unlocked" && (
            <div className="flex flex-col items-center text-center gap-5 py-6">
              {/* Glow ring */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(255,206,0,0.30) 0%, transparent 70%)", transform: "scale(2.2)" }}
                />
                <div className="relative w-16 h-16 rounded-full bg-amber flex items-center justify-center"
                  style={{ boxShadow: "0 0 32px rgba(255,206,0,0.45)" }}>
                  <Check size={30} color="#221D23" strokeWidth={3} />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#F5F0D8" }}>
                  {screen.title || "Module Complete!"}
                </h2>
                {screen.body && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(245,240,216,0.55)" }}>
                    {screen.body}
                  </p>
                )}
              </div>

              {/* Concepts earned */}
              {(mod.concepts || []).length > 0 && (
                <div className="w-full">
                  <div className="text-[10px] font-black tracking-[0.2em] mb-3" style={{ color: "rgba(255,206,0,0.60)" }}>
                    CONCEPTS UNLOCKED
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(mod.concepts || []).map((c, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(255,206,0,0.12)", color: "#FFCE00", border: "1px solid rgba(255,206,0,0.25)" }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {screen.next_module_title && (
                <p className="text-xs" style={{ color: "rgba(245,240,216,0.35)" }}>
                  Up next: {screen.next_module_title}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Swipe hint (first screen only) ── */}
        {step === 0 && total > 1 && (
          <div className="flex justify-center pb-1">
            <span
              className="text-[10px] tracking-wide"
              style={{ color: isUnlocked ? "rgba(245,240,216,0.25)" : "rgba(34,29,35,0.25)" }}
            >
              swipe to navigate
            </span>
          </div>
        )}

        {/* ── Bottom action ── */}
        <div
          className="px-5 pb-6 pt-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${isUnlocked ? "rgba(255,255,255,0.07)" : "rgba(34,29,35,0.07)"}` }}
        >
          <button
            onClick={next}
            disabled={isCheckLocked || finishing}
            className="w-full py-3 rounded-full font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              background: isUnlocked ? "#FFCE00" : accent.color,
              color: isUnlocked || screen.screen_type === "hook" ? "#221D23" : "#ffffff",
              opacity: isCheckLocked || finishing ? 0.30 : 1,
              cursor: isCheckLocked || finishing ? "not-allowed" : "pointer",
              boxShadow: isCheckLocked || finishing ? "none" : `0 4px 18px ${accent.color}40`,
            }}
          >
            {finishing ? "Saving…" : isLast ? (isUnlocked ? "🎉 Finish" : "Finish") : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
