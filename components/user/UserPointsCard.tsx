"use client";

/**
 * UserPointsCard
 * ──────────────
 * The "your progress" UI for logged-in users.
 *
 * Two layouts, both driven by the same FlipCounter:
 *   - {@link UserPointsSidebarCard}  — yellow card at the bottom of the desktop sidebar.
 *   - {@link UserPointsMobileStrip}  — yellow horizontal strip (Points | Rank | Streak) above mobile nav.
 *
 * The card animates whenever the incoming `points` prop changes (i.e. after the
 * server refreshes following an `award_points` RPC call). A subtle "+N" burst
 * floats up from the points stat, and each affected digit tile pulses + flips.
 *
 * Streak is shown as the secondary stat for Phase 1. Once Phase 2 ships the
 * leaderboard view, swap `streak` for `rankPercentile` in the parent.
 */

import { useEffect, useRef, useState } from "react";
import { Trophy, X } from "lucide-react";

/** Bright promo / points card yellow (reference UI). */
export const POINTS_CARD_YELLOW = "#FFD300";
const POINTS_CARD_MUTED = "#4a4035";
/** Vertical dividers between strip columns (brownish-yellow). */
const STRIP_DIVIDER = "rgba(74, 64, 53, 0.35)";

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
  const digitColor = tone === "dark" ? "#ffffff" : "rgba(255,255,255,0.92)";
  const tileClass = tone === "dark" ? "nudge-flip-tile" : "nudge-flip-tile-light";

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-md border border-white/[0.08] shrink-0"
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
    <div className="flex items-end gap-1" aria-live="polite">
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

// ── Desktop sidebar card (yellow) ─────────────────────────────────────────────

/**
 * Yellow card shown at the bottom of the desktop sidebar for logged-in users.
 * Matches the bright yellow guest promo treatment for a cohesive rail.
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
  const firstName = displayName?.trim()?.split(/\s+/)?.[0];
  const greeting =
    firstName !== undefined && firstName.length > 0
      ? `Welcome back, ${firstName}`
      : "Your progress";
  const burst = usePointsBurst(points);
  const topPctClamped =
    topPercent !== null && Number.isFinite(topPercent)
      ? Math.min(100, Math.max(1, Math.round(topPercent)))
      : null;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/[0.1] shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
      style={{ backgroundColor: POINTS_CARD_YELLOW }}
    >
      <div className="space-y-3 px-4 pt-4 pb-4">
        <p
          className="m-0 text-[10px] font-bold uppercase tracking-[0.12em] leading-snug"
          style={{ color: POINTS_CARD_MUTED }}
        >
          {greeting}
        </p>

        <div>
          <p
            className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: POINTS_CARD_MUTED }}
          >
            Points
          </p>
          <div className="relative mt-1.5 inline-flex">
            {burst ? <PointsBurst delta={burst.delta} tone="dark" /> : null}
            <FlipCounter value={points} size={30} tone="dark" />
          </div>
        </div>

        {topPctClamped !== null && (
          <div
            className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-homeInk px-3 py-2 text-[12px] leading-tight"
            aria-label={`You are in the top ${topPctClamped} percent of users`}
          >
            <span className="font-medium text-white/70">You are in</span>
            <span className="font-extrabold" style={{ color: POINTS_CARD_YELLOW }}>
              Top {topPctClamped}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mobile bottom strip (yellow) ──────────────────────────────────────────────

/**
 * Fixed mobile strip above the bottom nav: Points | Rank | Streak on yellow with column dividers.
 * Dismissal is in-memory only — the strip reappears on every page refresh.
 */
export function UserPointsMobileStrip({
  points,
  streak,
  topPercent = null,
}: {
  points: number;
  streak: number;
  /** "Top X%" from `get_user_top_percent` RPC. */
  topPercent?: number | null;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const topPctClamped =
    topPercent !== null && Number.isFinite(topPercent)
      ? Math.min(100, Math.max(1, Math.round(topPercent)))
      : null;

  const burst = usePointsBurst(points);

  const labelClass =
    "m-0 text-[8px] font-semibold uppercase tracking-[0.12em] leading-none mb-1";

  return (
    <>
      <div className="sm:hidden h-[76px] shrink-0" aria-hidden />

      <section
        aria-label="Your progress"
        className="sm:hidden fixed inset-x-0 bottom-0 z-[49] pointer-events-none pb-[calc(76px+env(safe-area-inset-bottom,0px))]"
      >
        <div
          className="pointer-events-auto w-full border-y border-black shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: POINTS_CARD_YELLOW }}
        >
          <div className="relative flex min-h-[52px] items-stretch px-1 py-2 pr-9">
            <button
              type="button"
              aria-label="Dismiss progress strip"
              onClick={() => setDismissed(true)}
              className="absolute right-1 top-1/2 z-[1] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-black/10"
              style={{ color: POINTS_CARD_MUTED }}
            >
              <X size={14} strokeWidth={2.25} aria-hidden />
            </button>

            {/* Points */}
            <div
              className="flex min-w-0 flex-1 flex-col items-start justify-center border-r px-1.5 py-0.5 sm:px-2"
              style={{ borderColor: STRIP_DIVIDER }}
            >
              <p className={labelClass} style={{ color: POINTS_CARD_MUTED }}>
                Points
              </p>
              <div className="relative inline-flex max-w-full">
                {burst ? <PointsBurst delta={burst.delta} tone="dark" /> : null}
                <FlipCounter value={points} size={17} tone="dark" />
              </div>
            </div>

            {/* Rank */}
            <div
              className="flex min-w-0 flex-1 flex-col items-start justify-center border-r px-1.5 py-0.5 text-left"
              style={{ borderColor: STRIP_DIVIDER }}
            >
              <p className={labelClass} style={{ color: POINTS_CARD_MUTED }}>
                Rank
              </p>
              {topPctClamped !== null ? (
                <p
                  className="m-0 max-w-full text-[10px] leading-tight text-homeInk"
                  aria-label={`You are in the top ${topPctClamped} percent of users`}
                >
                  <span className="font-medium">You are in </span>
                  <span className="font-extrabold">
                    Top {topPctClamped}%
                  </span>
                </p>
              ) : (
                <p className="m-0 flex items-center gap-0.5 text-[10px] font-medium leading-tight text-homeInk/80">
                  <Trophy size={11} strokeWidth={2.25} className="shrink-0" aria-hidden />
                  <span className="line-clamp-2">Earn points to rank</span>
                </p>
              )}
            </div>

            {/* Streak */}
            <div className="flex min-w-0 flex-[0.85] flex-col items-start justify-center pl-1.5 pr-1 py-0.5 sm:pl-2">
              <p className={labelClass} style={{ color: POINTS_CARD_MUTED }}>
                Streak
              </p>
              <p className="m-0 flex items-center gap-0.5 text-[11px] font-extrabold leading-none text-homeInk">
                <span aria-hidden>🔥</span>
                <span className="tabular-nums">
                  {streak} {streak === 1 ? "day" : "days"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
