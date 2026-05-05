"use client";

import { useRef, useState } from "react";
import { Check, ChevronLeft, X } from "lucide-react";
import type { Module, ModuleScreen } from "@/lib/types";

interface Props {
  module: Module;
  screens: ModuleScreen[];
  onClose?: () => void;
}

export default function ModulePlayer({ module: mod, screens, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const total = screens.length;

  function next() {
    if (step >= total - 1) {
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
        className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="w-full md:max-w-lg md:rounded-2xl rounded-t-3xl flex flex-col items-center justify-center py-16 gap-4"
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

  // ── colour tokens based on screen type ────────────────────────────────
  const panelBg = isUnlocked ? "#1c1814" : "#ffffff";
  const textPrimary = isUnlocked ? "#F5F0D8" : "#221D23";
  const textMuted = isUnlocked ? "rgba(245,240,216,0.55)" : "#6B6B6B";

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* ── Panel ── */}
      <div
        className="relative w-full md:max-w-lg md:rounded-2xl rounded-t-3xl flex flex-col select-none overflow-hidden"
        style={{
          background: panelBg,
          maxHeight: "90vh",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          border: isUnlocked
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(34,29,35,0.10)",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top-accent strip: amber on unlocked, majorelle on others */}
        <div
          className="h-0.5 w-full flex-shrink-0"
          style={{
            background: isUnlocked
              ? "linear-gradient(90deg,#FFCE00,#FFCE0060,transparent)"
              : "linear-gradient(90deg,#623CEA,#623CEA60,transparent)",
          }}
        />

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          {/* Back / close */}
          <button
            type="button"
            onClick={step > 0 ? back : handleClose}
            className="rounded-full p-1.5 transition"
            style={{ color: textMuted }}
            aria-label={step > 0 ? "Previous" : "Close"}
          >
            {step > 0 ? <ChevronLeft size={20} /> : <X size={20} />}
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? "20px" : "10px",
                  background:
                    i < step
                      ? "#623CEA"
                      : i === step
                      ? "#FFCE00"
                      : isUnlocked
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </div>

          {/* Step counter */}
          <div
            className="text-[11px] font-bold tabular-nums w-10 text-right"
            style={{ color: textMuted }}
          >
            {step + 1}/{total}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4"
          style={{ minHeight: 0 }}
        >
          {!isUnlocked && screen.label && screen.screen_type !== "example" && (
            <div className="text-[11px] font-medium tracking-[0.08em] text-nblue mb-4 uppercase">
              {screen.label}
            </div>
          )}

          {/* hook */}
          {screen.screen_type === "hook" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xl md:text-2xl font-semibold leading-tight" style={{ color: textPrimary }}>
                {screen.title}
              </h2>
              {screen.body && (
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
                  {screen.body}
                </p>
              )}
            </div>
          )}

          {/* idea */}
          {screen.screen_type === "idea" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold leading-tight" style={{ color: textPrimary }}>
                {screen.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
                {screen.body}
              </p>
            </div>
          )}

          {/* example */}
          {screen.screen_type === "example" && (
            <div className="flex flex-col gap-3">
              {screen.title && (
                <h2 className="text-base font-semibold" style={{ color: textPrimary }}>
                  {screen.title}
                </h2>
              )}
              {screen.body &&
                (() => {
                  const tone = screen.tone || "neutral";
                  const bg = tone === "bad" ? "#FAECE7" : tone === "good" ? "#E1F5EE" : "#f3f1ec";
                  const labelColor = tone === "bad" ? "#993C1D" : tone === "good" ? "#0F6E56" : "#666";
                  return (
                    <div className="rounded-xl p-3.5" style={{ background: bg }}>
                      {screen.label && (
                        <div className="text-xs font-medium mb-1" style={{ color: labelColor }}>
                          {screen.label}
                        </div>
                      )}
                      <div className="text-sm text-shadow leading-snug">{screen.body}</div>
                      {tokens.length > 0 && (
                        <div className="mt-2">
                          {tokens.map((tk, j) => (
                            <span
                              key={j}
                              className={`inline-block rounded px-2 py-0.5 mr-1.5 mb-1 text-xs font-semibold tracking-tight
                                ${tk.style === "highlight" ? "bg-[#EEEDFE] text-[#3C3489]"
                                  : tk.style === "dimmed" ? "bg-black/10 text-shadow/40"
                                  : "bg-[#e8e6e0] text-shadow"}`}
                            >
                              {tk.text}
                            </span>
                          ))}
                          <div className="text-[11px] text-muted mt-2 font-medium">
                            Phrases worth noticing in this example
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          )}

          {/* why */}
          {screen.screen_type === "why" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold" style={{ color: textPrimary }}>
                {screen.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
                {screen.body}
              </p>
            </div>
          )}

          {/* check */}
          {screen.screen_type === "check" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold leading-snug" style={{ color: textPrimary }}>
                {screen.question}
              </h2>
              <div className="flex flex-col gap-2">
                {options.map((opt, i) => {
                  const sel = answer === i;
                  const correct = i === correctIndex;
                  const reveal = answer !== null;
                  let bg = "#fff", border = "rgba(0,0,0,0.12)", color = "#221D23";
                  if (reveal && correct) { bg = "#E1F5EE"; border = "#0F6E56"; color = "#0F6E56"; }
                  else if (reveal && sel && !correct) { bg = "#FAECE7"; border = "#993C1D"; color = "#993C1D"; }
                  else if (sel) { bg = "#EEEDFE"; border = "#623CEA"; color = "#3C3489"; }
                  return (
                    <button
                      key={i}
                      onClick={() => answer === null && setAnswer(i)}
                      className="text-left rounded-xl px-4 py-3 flex items-center gap-3 transition"
                      style={{ background: bg, border: `1px solid ${border}`, color, cursor: reveal ? "default" : "pointer" }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                        style={{ border: `1px solid ${border}` }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {answer !== null && (
                <p className="text-xs text-muted leading-relaxed">
                  {answer === correctIndex ? screen.feedback_correct : screen.feedback_incorrect}
                </p>
              )}
            </div>
          )}

          {/* unlocked */}
          {screen.screen_type === "unlocked" && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-amber mx-auto mb-5 flex items-center justify-center">
                <Check size={28} color="#221D23" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: textPrimary }}>
                {screen.title}
              </h2>
              {screen.body && (
                <p className="text-sm mb-3" style={{ color: textMuted }}>
                  {screen.body}
                </p>
              )}
              <p className="text-sm font-semibold text-amber">
                {(mod.concepts || []).join(" · ")}
              </p>
              {screen.next_module_title && (
                <p className="text-xs mt-8" style={{ color: textMuted }}>
                  Next: {screen.next_module_title}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Swipe hint (first screen, mobile only) ── */}
        {step === 0 && total > 1 && (
          <div className="flex justify-center pb-1 md:hidden">
            <span className="text-[10px] tracking-wide opacity-30" style={{ color: textMuted }}>
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
            disabled={isCheckLocked}
            className="w-full py-3 rounded-full font-semibold text-sm transition-all active:scale-[0.98]"
            style={{
              background: isUnlocked ? "#FFCE00" : "#221D23",
              color: isUnlocked ? "#221D23" : "#ffffff",
              opacity: isCheckLocked ? 0.35 : 1,
              cursor: isCheckLocked ? "not-allowed" : "pointer",
            }}
          >
            {isLast ? "Finish" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
