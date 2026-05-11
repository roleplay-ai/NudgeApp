"use client";

/**
 * UserPointsCard
 * ──────────────
 * The "your progress" UI for logged-in users.
 *
 * Two layouts, both driven by the same FlipCounter:
 *   - {@link UserPointsSidebarCard}  — dark card at the bottom of the desktop sidebar.
 *   - {@link UserPointsMobileStrip}  — light strip fixed above the mobile bottom nav.
 *
 * The card animates whenever the incoming `points` prop changes (i.e. after the
 * server refreshes following an `award_points` RPC call). A subtle "+N" burst
 * floats up from the points stat, and each affected digit tile pulses + flips.
 *
 * Streak is shown as the secondary stat for Phase 1. Once Phase 2 ships the
 * leaderboard view, swap `streak` for `rankPercentile` in the parent.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Trophy, X } from "lucide-react";

// ── FlipCounter primitive ─────────────────────────────────────────────────────

type FlipTone = "dark" | "light";

function FlipDigit({
  char,
  animateKey,
  size,
  tone,
}: {
  char: string;
  animateKey: number;
  size: number;
  tone: FlipTone;
}) {
  const w = Math.round(size * 0.82);
  const h = Math.round(size * 1.22);
  const fontSize = Math.round(size * 0.6);

  const tileBg = tone === "dark" ? "#1e1a1f" : "#221D23";
  const digitColor = tone === "dark" ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.92)";
  const tileClass = tone === "dark" ? "nudge-flip-tile" : "nudge-flip-tile-light";

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-[2px] border border-white/[0.05] shrink-0"
      style={{
        width: w,
        height: h,
        background: tileBg,
        animation: animateKey > 0 ? undefined : "none",
      }}
      key={`tile-${animateKey}`}
    >
      <div
        className={animateKey > 0 ? tileClass : undefined}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 z-[2] h-px bg-black/40"
        aria-hidden
      />
      <span
        key={`digit-${animateKey}`}
        className={`relative z-[1] font-bold leading-none ${animateKey > 0 ? "nudge-flip-digit" : ""}`}
        style={{ fontSize, color: digitColor }}
      >
        {char}
      </span>
    </div>
  );
}

function FlipCounter({
  value,
  size = 13,
  tone = "dark",
}: {
  value: number;
  size?: number;
  tone?: FlipTone;
}) {
  const chars = Math.max(0, Math.floor(value)).toLocaleString().split("");
  const prev = useRef(value);
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value;
      setAnimateKey((k) => k + 1);
    }
  }, [value]);

  const commaColor = tone === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";

  return (
    <div className="flex items-end gap-[1px]" aria-live="polite">
      {chars.map((ch, i) =>
        ch === "," ? (
          <span
            key={`sep-${i}`}
            className="pb-px font-semibold"
            style={{ color: commaColor, fontSize: size * 0.48 }}
          >
            ,
          </span>
        ) : (
          <FlipDigit
            key={`d-${chars.length - i}-${animateKey}`}
            char={ch}
            animateKey={animateKey}
            size={size}
            tone={tone}
          />
        ),
      )}
    </div>
  );
}

// ── Burst hook: emits a "+N" pulse when the value increases ───────────────────

function usePointsBurst(points: number): { burstId: number; delta: number } | null {
  const prev = useRef(points);
  const [burst, setBurst] = useState<{ burstId: number; delta: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delta = points - prev.current;
    prev.current = points;
    if (delta > 0) {
      setBurst({ burstId: Date.now(), delta });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setBurst(null), 700);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [points]);

  return burst;
}

function PointsBurst({ delta, tone }: { delta: number; tone: FlipTone }) {
  const color = tone === "dark" ? "#F68A29" : "#E64A19";
  return (
    <span
      className="nudge-points-burst pointer-events-none absolute -top-px right-0 z-[2] text-[9px] font-bold"
      style={{ color }}
      aria-hidden
    >
      +{delta}
    </span>
  );
}

// ── Shared stat row (Points | Streak) ─────────────────────────────────────────

function StatRow({
  points,
  streak,
  tone,
}: {
  points: number;
  streak: number;
  tone: FlipTone;
}) {
  const burst = usePointsBurst(points);
  const labelColor = tone === "dark" ? "text-white/30" : "text-muted";
  const dividerColor = tone === "dark" ? "bg-white/[0.07]" : "bg-nborder";
  const streakColor = tone === "dark" ? "#FFCE00" : "#221D23";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {burst ? <PointsBurst delta={burst.delta} tone={tone} /> : null}
        <div
          className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.06em] ${labelColor}`}
        >
          Points
        </div>
        <FlipCounter value={points} size={13} tone={tone} />
      </div>

      <div className={`h-[26px] w-px ${dividerColor}`} aria-hidden />

      <div>
        <div
          className={`mb-1 text-[8px] font-semibold uppercase tracking-[0.06em] ${labelColor}`}
        >
          Streak
        </div>
        <div className="flex items-baseline gap-1">
          <Flame size={11} className="self-center" style={{ color: streakColor }} />
          <span
            className="font-extrabold tabular-nums leading-none"
            style={{ fontSize: 14, color: streakColor }}
          >
            {streak}
          </span>
          <span
            className="text-[9px] font-semibold lowercase"
            style={{ color: tone === "dark" ? "rgba(255,255,255,0.5)" : "#6B6B6B" }}
          >
            {streak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Desktop sidebar card (dark) ───────────────────────────────────────────────

/**
 * Dark card shown at the bottom of the desktop sidebar for logged-in users.
 * Mirrors the visual style of `GuestAccountSidebarCard` (yellow top rule,
 * rounded 2xl, soft shadow) so the sidebar feels cohesive across auth states.
 */
export function UserPointsSidebarCard({
  points,
  streak,
  displayName,
}: {
  points: number;
  streak: number;
  displayName?: string | null;
}) {
  const greeting = displayName?.trim() ? `Welcome back, ${displayName.split(" ")[0]}` : "Your progress";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1e1a1f] shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <div className="h-[3px] w-full bg-amber" aria-hidden />
      <div className="space-y-3 px-3.5 pt-3.5 pb-4">
        <div className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white/30">
          <Trophy size={10} strokeWidth={2.25} className="text-norange" aria-hidden />
          <span className="leading-none">{greeting}</span>
        </div>
        <StatRow points={points} streak={streak} tone="dark" />
        <Link
          href="/profile"
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-full bg-white/[0.04] py-2 text-[11px] font-bold text-amber no-underline transition-colors hover:bg-white/[0.08]"
        >
          See your profile
          <ArrowRight size={12} strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

// ── Mobile bottom strip (light) ───────────────────────────────────────────────

const MOBILE_DISMISS_KEY = "nudgeable_points_strip_dismissed";

/**
 * Fixed mobile strip shown above the bottom nav for logged-in users.
 * Replaces {@link GuestAccountMobileStrip} when the user has a session.
 * Dismissal is session-only (sessionStorage) so it returns each visit.
 */
export function UserPointsMobileStrip({
  points,
  streak,
  displayName,
}: {
  points: number;
  streak: number;
  displayName?: string | null;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(MOBILE_DISMISS_KEY) === "1") {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  const greeting = displayName?.trim() ? `Hi, ${displayName.split(" ")[0]}` : "Your progress";

  return (
    <>
      {/* Scroll clearance so content isn't hidden behind the fixed strip */}
      <div className="sm:hidden h-[84px] shrink-0" aria-hidden />

      <section
        aria-label="Your progress"
        className="sm:hidden fixed inset-x-0 bottom-0 z-[49] pointer-events-none pb-[calc(76px+env(safe-area-inset-bottom,0px))]"
      >
        <div className="pointer-events-auto w-full border-t-[3px] border-amber bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="relative flex items-center gap-3 px-3.5 py-2 pr-9">
            <button
              type="button"
              aria-label="Dismiss progress strip"
              onClick={() => {
                setDismissed(true);
                try {
                  sessionStorage.setItem(MOBILE_DISMISS_KEY, "1");
                } catch {
                  /* sessionStorage unavailable; ignore */
                }
              }}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-homeSubtle/90 transition-colors hover:bg-homeInk/[0.06] hover:text-homeInk"
            >
              <X size={15} strokeWidth={2.25} aria-hidden />
            </button>

            <div className="min-w-0">
              <p className="m-0 inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.06em] text-muted whitespace-nowrap">
                <Trophy size={10} strokeWidth={2.25} className="text-norange" aria-hidden />
                {greeting}
              </p>
            </div>

            <div className="ml-auto mr-1 shrink-0">
              <StatRow points={points} streak={streak} tone="light" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
