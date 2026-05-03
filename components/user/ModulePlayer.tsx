"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import type { Module, ModuleScreen } from "@/lib/types";

export default function ModulePlayer({ module: mod, screens }: { module: Module; screens: ModuleScreen[] }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);

  const total = screens.length;
  const screen = screens[step];
  const isUnlocked = screen.screen_type === "unlocked";
  const isLast = step === total - 1;

  // For check screens: derive options array and correct index from screen_options
  const options = screen.screen_options?.map((o) => o.option_text) ?? [];
  const correctIndex = screen.screen_options?.findIndex((o) => o.is_correct) ?? -1;
  const isCheckLocked = screen.screen_type === "check" && answer === null;

  // For example screens: get token texts
  const tokens = screen.screen_tokens?.map((t) => ({ text: t.token_text, style: t.style })) ?? [];

  function next() {
    if (isLast) {
      window.location.href = "/learn";
      return;
    }
    setAnswer(null);
    setStep(step + 1);
  }

  return (
    <div className={`fixed inset-0 z-50 ${isUnlocked ? "bg-shadow" : "bg-[#fafaf7]"} flex flex-col`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 md:pt-6">
        <Link href="/learn" className={isUnlocked ? "text-chiffon" : "text-muted"}>
          <X size={22} />
        </Link>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="w-5 h-1 rounded-full"
              style={{ background: i <= step ? "#623CEA" : "rgba(0,0,0,0.12)" }} />
          ))}
        </div>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-2xl mx-auto w-full">
        {!isUnlocked && screen.label && (
          <div className="text-[11px] font-medium tracking-[0.08em] text-nblue mb-4 uppercase">
            {screen.label}
          </div>
        )}

        {screen.screen_type === "hook" && (
          <>
            <h2 className="text-2xl md:text-3xl font-medium leading-tight text-shadow mb-3">{screen.title}</h2>
            {screen.body && <p className="text-muted leading-relaxed">{screen.body}</p>}
          </>
        )}

        {screen.screen_type === "idea" && (
          <>
            <h2 className="text-xl md:text-2xl font-medium leading-tight text-shadow mb-3">{screen.title}</h2>
            <p className="text-shadow/80 leading-relaxed">{screen.body}</p>
          </>
        )}

        {screen.screen_type === "example" && (
          <>
            {screen.title && <h2 className="text-lg font-medium text-shadow mb-3">{screen.title}</h2>}
            {screen.body && (() => {
              const tone = screen.tone || "neutral";
              const bg = tone === "bad" ? "#FAECE7" : tone === "good" ? "#E1F5EE" : "#f3f1ec";
              const labelColor = tone === "bad" ? "#993C1D" : tone === "good" ? "#0F6E56" : "#666";
              return (
                <div className="rounded-xl p-3.5 mb-3" style={{ background: bg }}>
                  {screen.label && (
                    <div className="text-xs font-medium mb-1" style={{ color: labelColor }}>{screen.label}</div>
                  )}
                  <div className="text-sm text-shadow leading-snug">{screen.body}</div>
                  {tokens.length > 0 && (
                    <div className="mt-2">
                      {tokens.map((tk, j) => (
                        <span key={j}
                          className={`inline-block rounded px-2 py-0.5 mr-1.5 mb-1 font-mono text-xs
                            ${tk.style === "highlight" ? "bg-[#EEEDFE] text-[#3C3489]" : tk.style === "dimmed" ? "bg-black/10 text-shadow/40" : "bg-[#e8e6e0] text-shadow"}`}>
                          {tk.text}
                        </span>
                      ))}
                      <div className="text-sm font-medium mt-1">{tokens.length} tokens</div>
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}

        {screen.screen_type === "why" && (
          <>
            <h2 className="text-xl md:text-2xl font-medium text-shadow mb-3">{screen.title}</h2>
            <p className="text-shadow/80 leading-relaxed">{screen.body}</p>
          </>
        )}

        {screen.screen_type === "check" && (
          <>
            <h2 className="text-lg md:text-xl font-medium text-shadow mb-5">{screen.question}</h2>
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
                  <button key={i} onClick={() => answer === null && setAnswer(i)}
                    className="text-left rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: bg, border: `1px solid ${border}`, color, cursor: reveal ? "default" : "pointer" }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
                      style={{ border: `1px solid ${border}` }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
            {answer !== null && (
              <p className="text-xs text-muted mt-4">
                {answer === correctIndex ? screen.feedback_correct : screen.feedback_incorrect}
              </p>
            )}
          </>
        )}

        {screen.screen_type === "unlocked" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber mx-auto mb-5 flex items-center justify-center">
              <Check size={28} color="#221D23" strokeWidth={3} />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-chiffon mb-2">{screen.title}</h2>
            {screen.body && <p className="text-sm text-chiffon/70 mb-3">{screen.body}</p>}
            <p className="text-base font-medium text-amber">{(mod.concepts || []).join(" · ")}</p>
            {screen.next_module_title && (
              <p className="text-xs text-chiffon/60 mt-8">Next: {screen.next_module_title}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-8 pt-4 max-w-2xl mx-auto w-full">
        <button onClick={next} disabled={isCheckLocked}
          className={`w-full py-3.5 rounded-full font-medium text-sm transition
            ${isUnlocked ? "bg-amber text-shadow" : "bg-shadow text-white"}
            ${isCheckLocked ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"}`}>
          {isLast ? "Finish" : "Continue"}
        </button>
      </div>
    </div>
  );
}
