"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, X } from "lucide-react";
import type { ApplyTask, ApplySlide } from "@/lib/types";

export default function TileSlideshow({ task, slides }: { task: ApplyTask; slides: ApplySlide[] }) {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  if (slides.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">No slides yet for this task.</p>
        <Link href="/apply" className="text-dodger underline">Back to Apply</Link>
      </div>
    );
  }

  const current = slides[step];
  const total = slides.length;
  const isLast = step === total - 1;

  async function copyPrompt() {
    if (!current.prompt_text) return;
    await navigator.clipboard.writeText(current.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        {step === 0 ? (
          <Link href="/apply" className="text-muted hover:text-shadow">
            <X size={22} />
          </Link>
        ) : (
          <button onClick={() => setStep(step - 1)} className="text-muted hover:text-shadow">
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="flex-1 h-1.5 bg-nborder rounded-full overflow-hidden">
          <div className="h-full bg-amber transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
        <span className="text-[11px] text-muted font-semibold min-w-[2rem] text-right">
          {step + 1}/{total}
        </span>
      </div>

      {/* Task name */}
      <div className="text-[10px] font-bold tracking-[2px] text-norange mb-3">{task.title}</div>

      {/* Caption (instruction) */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-shadow mb-4 leading-tight">
        {current.caption}
      </h2>

      {/* Image or mock placeholder */}
      <div className="bg-white rounded-2xl p-2 mb-4 shadow-sm border border-nborder">
        {current.image_url ? (
          <img src={current.image_url} alt={current.caption}
            className="w-full rounded-xl max-h-[420px] object-contain" />
        ) : (
          <div className="bg-nborder/30 rounded-xl h-48 flex items-center justify-center text-muted text-xs">
            {current.mock_type || "No preview"}
          </div>
        )}
      </div>

      {/* Prompt block (copyable) */}
      {current.prompt_text && (
        <div className="bg-chiffon rounded-xl p-4 mb-4 relative">
          <div className="text-[10px] font-bold tracking-wider text-norange mb-2">PROMPT TO TRY</div>
          <p className="text-sm text-shadow leading-relaxed pr-8">{current.prompt_text}</p>
          <button onClick={copyPrompt}
            className="absolute top-3 right-3 text-muted hover:text-shadow transition">
            <Copy size={15} />
          </button>
          {copied && (
            <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald">Copied!</span>
          )}
        </div>
      )}

      {/* Next button */}
      {isLast ? (
        <Link href="/apply"
          className="block w-full bg-amber text-shadow font-semibold py-3.5 rounded-full text-center hover:opacity-90">
          Done
        </Link>
      ) : (
        <button onClick={() => setStep(step + 1)}
          className="w-full bg-amber text-shadow font-semibold py-3.5 rounded-full hover:opacity-90">
          Next
        </button>
      )}
    </div>
  );
}
