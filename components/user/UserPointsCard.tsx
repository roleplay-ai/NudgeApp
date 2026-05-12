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
import { Flame, Trophy, X } from "lucide-react";

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

type StatSize = "sm" | "md";

function StatRow({
  points,
  streak,
  tone,
  size = "sm",
}: {
  points: number;
  streak: number;
  tone: FlipTone;
  /** "sm" (default) — mobile strip; "md" — desktop sidebar (more legible). */
  size?: StatSize;
}) {
  const burst = usePointsBurst(points);
  const labelColor = tone === "dark" ? "text-white/40" : "text-muted";
  const dividerColor = tone === "dark" ? "bg-white/[0.07]" : "bg-nborder";
  // Streak is always rendered in amber so the mobile (light) strip matches the
  // desktop sidebar's yellow flame/number treatment.
  const streakColor = "#FFCE00";

  const dims = size === "md"
    ? {
        flip: 22,
        streakFont: 24,
        streakIcon: 16,
        labelClass: "text-[11px]",
        divider: "h-[40px]",
        gap: "gap-4",
        unitClass: "text-[11px]",
      }
    : {
        flip: 20,
        streakFont: 14,
        streakIcon: 11,
        labelClass: "text-[9px]",
        divider: "h-[26px]",
        gap: "gap-3",
        unitClass: "text-[9px]",
      };

  return (
    <div className={`flex items-center ${dims.gap}`}>
      {/* Points — label on the left of a bigger flip counter. */}
      <div className="relative flex items-center gap-2">
        {burst ? <PointsBurst delta={burst.delta} tone={tone} /> : null}
        <span
          className={`${dims.labelClass} font-semibold uppercase tracking-[0.06em] ${labelColor}`}
        >
          Points
        </span>
        <FlipCounter value={points} size={dims.flip} tone={tone} />
      </div>

      <div className={`${dims.divider} w-px ${dividerColor}`} aria-hidden />

      <div>
        <div
          className={`mb-1 ${dims.labelClass} font-semibold uppercase tracking-[0.06em] ${labelColor}`}
        >
          Streak
        </div>
        <div className="flex items-baseline gap-1">
          <Flame size={dims.streakIcon} className="self-center" style={{ color: streakColor }} />
          <span
            className="font-extrabold tabular-nums leading-none"
            style={{ fontSize: dims.streakFont, color: streakColor }}
          >
            {streak}
          </span>
          <span
            className={`${dims.unitClass} font-semibold lowercase`}
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
  displayName,
  topPercent = null,
}: {
  points: number;
  displayName?: string | null;
  /** "Top X%" from `get_user_top_percent` RPC. Null skips the pill (e.g. solo user, RPC error). */
  topPercent?: number | null;
}) {
  const greeting = displayName?.trim() ? `Welcome back, ${displayName.split(" ")[0]}` : "Your progress";
  const burst = usePointsBurst(points);
  // Clamp defensively in case the RPC ever returns 0 / >100; the pill should
  // always read like a sensible percentile, never "top 0%".
  const topPctClamped =
    topPercent !== null && Number.isFinite(topPercent)
      ? Math.min(100, Math.max(1, Math.round(topPercent)))
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1e1a1f] shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <div className="h-[3px] w-full bg-amber" aria-hidden />
      <div className="space-y-3 px-4 pt-4 pb-4">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
          <Trophy size={12} strokeWidth={2.25} className="text-norange" aria-hidden />
          <span className="leading-none">{greeting}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
            Points
          </span>
          <div className="relative">
            {burst ? <PointsBurst delta={burst.delta} tone="dark" /> : null}
            <FlipCounter value={points} size={30} tone="dark" />
          </div>
        </div>
        {topPctClamped !== null && (
          <div
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-full bg-white/[0.05] py-2 text-[12px] font-bold text-white/70"
            aria-label={`You are in the top ${topPctClamped} percent of users`}
          >
            You are in top <span className="text-amber">{topPctClamped}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mobile bottom strip (light) ───────────────────────────────────────────────

/**
 * Fixed mobile strip shown above the bottom nav for logged-in users.
 * Replaces {@link GuestAccountMobileStrip} when the user has a session.
 * Dismissal is in-memory only — the strip reappears on every page refresh.
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
              onClick={() => setDismissed(true)}
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
