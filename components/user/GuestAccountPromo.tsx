"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BarChart3, GraduationCap, Lock, Trophy, X } from "lucide-react";

/** Bright promo yellow — matches points strip (`UserPointsCard`). */
const PROMO_YELLOW = "#FFD300";
const PROMO_MUTED = "#4a4035";

const signupHref = "/signup";
const loginHref = "/login";

/** Desktop: yellow card at bottom of dark sidebar (reference UI). */
export function GuestAccountSidebarCard() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/[0.1] shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
      style={{ backgroundColor: PROMO_YELLOW }}
    >
      <div className="space-y-3 px-4 pt-4 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-homeInk px-2.5 py-1.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: PROMO_YELLOW }}
            aria-hidden
          />
          <span className="text-[9px] font-black uppercase leading-none tracking-[0.14em] text-white">
            See your rank
          </span>
        </div>

        <p className="m-0 text-[15px] font-extrabold leading-snug tracking-tight text-homeInk">
          Sign in to join the leaderboard.
        </p>

        <ul className="m-0 list-none space-y-2.5 p-0">
          <li className="flex items-start gap-2.5">
            <BarChart3 size={16} className="mt-0.5 shrink-0 text-homeInk" strokeWidth={3} aria-hidden />
            <span className="text-[13px] font-medium leading-snug text-homeInk/90">See your AI fluency rank</span>
          </li>
          <li className="flex items-start gap-2.5">
            <GraduationCap size={16} className="mt-0.5 shrink-0 text-homeInk" strokeWidth={3} aria-hidden />
            <span className="text-[13px] font-medium leading-snug text-homeInk/90">
              75% off AI for Work Course
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <Lock size={16} className="mt-0.5 shrink-0 text-homeInk" strokeWidth={3} aria-hidden />
            <span className="text-[13px] font-medium leading-snug text-homeInk/90">All modules unlocked</span>
          </li>
        </ul>

        <Link
          href={signupHref}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-homeInk py-3 px-4 text-[13px] font-bold text-white no-underline transition-opacity hover:opacity-92"
        >
          Create free account
          <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
        </Link>

        <Link
          href={loginHref}
          className="flex w-full items-center justify-center rounded-full border-2 border-homeInk/30 bg-transparent py-2.5 px-4 text-[13px] font-bold text-homeInk no-underline transition-colors hover:border-homeInk/50 hover:bg-black/[0.04]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

/** Mobile: fixed above bottom nav (reference UI). Hidden on sm+. Dismiss is session-only (returns after refresh). */
export function GuestAccountMobileStrip() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <>
      <div className="sm:hidden h-[100px] shrink-0" aria-hidden />

      <section
        aria-label="Create an account"
        className="sm:hidden fixed inset-x-0 bottom-0 z-[49] pointer-events-none pb-[calc(76px+env(safe-area-inset-bottom,0px))]"
      >
        <div
          className="pointer-events-auto w-full border-x border-t border-black/10 shadow-[0_-6px_24px_rgba(0,0,0,0.14)]"
          style={{ backgroundColor: PROMO_YELLOW }}
        >
          <div className="relative flex flex-row items-center gap-2.5 rounded-t-2xl px-3.5 py-2.5 pr-10">
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-black/10"
              style={{ color: PROMO_MUTED }}
            >
              <X size={15} strokeWidth={2.25} aria-hidden />
            </button>

            <Trophy size={20} strokeWidth={2.25} className="shrink-0 text-amber-800" aria-hidden />

            <div className="min-w-0 flex-1 space-y-0.5 leading-tight">
              <p
                className="m-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-homeInk"
              >
                See your rank
              </p>
              <p className="m-0 text-[13px] font-extrabold leading-tight text-homeInk">
                Sign in to join the leaderboard.
              </p>
              <p className="m-0 line-clamp-2 text-[10px] leading-snug" style={{ color: PROMO_MUTED }}>
                75% off AI for Work Course · All modules unlocked
              </p>
            </div>

            <Link
              href={signupHref}
              className="inline-flex shrink-0 items-center justify-center gap-0.5 rounded-full bg-homeInk px-3.5 py-2 text-[11px] font-bold text-white no-underline transition-opacity hover:opacity-92 whitespace-nowrap"
            >
              Sign up
              <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
