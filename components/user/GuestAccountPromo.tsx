"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BarChart3, GraduationCap, Lock, X } from "lucide-react";

const PROMO_ORANGE = "#E64A19";

const signupHref = "/signup";
const loginHref = "/login";

/** Desktop: white card at bottom of dark sidebar (reference UI). */
export function GuestAccountSidebarCard() {
  return (
    <div className="rounded-2xl bg-white border border-black/[0.06] shadow-[0_8px_28px_rgba(0,0,0,0.12)] overflow-hidden">
      <div className="h-[3px] bg-amber w-full" aria-hidden />
      <div className="px-3.5 pt-3.5 pb-4 space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-norange shrink-0" aria-hidden />
          <span className="text-[9px] font-black tracking-[0.12em] text-homeInk uppercase leading-none">
            Where do you rank?
          </span>
        </div>

        <p className="text-[14px] font-extrabold text-homeInk leading-snug tracking-tight m-0">
          Find out. Don&apos;t lose your progress.
        </p>

        <ul className="space-y-2 list-none m-0 p-0">
          <li className="flex gap-2 items-start">
            <BarChart3 size={15} className="text-homeClay shrink-0 mt-0.5" strokeWidth={2.25} aria-hidden />
            <span className="text-[12px] text-homeBodyMuted leading-snug font-medium">See your AI fluency rank</span>
          </li>
          <li className="flex gap-2 items-start">
            <GraduationCap size={15} className="text-homeClay shrink-0 mt-0.5" strokeWidth={2.25} aria-hidden />
            <span className="text-[12px] text-homeBodyMuted leading-snug font-medium">
              75% off AI for Work Course
            </span>
          </li>
          <li className="flex gap-2 items-start">
            <Lock size={15} className="text-homeClay shrink-0 mt-0.5" strokeWidth={2.25} aria-hidden />
            <span className="text-[12px] text-homeBodyMuted leading-snug font-medium">All modules unlocked</span>
          </li>
        </ul>

        <Link
          href={signupHref}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-homeInk py-3 px-4 text-[13px] font-bold text-amber no-underline hover:opacity-92 transition-opacity"
        >
          Create free account
          <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
        </Link>

        <Link
          href={loginHref}
          className="block w-full text-center text-[11px] font-semibold text-homeSubtle hover:text-homeBodyMuted transition-colors no-underline"
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
      {/* Scroll clearance so the last sections aren’t hidden behind the fixed banner */}
      <div className="sm:hidden h-[88px] shrink-0" aria-hidden />

      <section
        aria-label="Create an account"
        className="sm:hidden fixed inset-x-0 bottom-0 z-[49] pointer-events-none pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      >
        {/* Full-bleed banner: yellow rule + flat white strip (reference mobile UI) */}
        <div className="pointer-events-auto w-full bg-white border-t-2 border-amber shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="relative flex flex-row items-center gap-2 pl-3.5 pr-9 py-2 max-w-none">
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="absolute top-1/2 -translate-y-1/2 right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-homeSubtle/90 hover:bg-homeInk/[0.06] hover:text-homeInk transition-colors"
            >
              <X size={15} strokeWidth={2.25} aria-hidden />
            </button>

            <div className="min-w-0 flex-1 space-y-0 leading-tight">
              <p
                className="text-[9px] font-black tracking-[0.12em] uppercase m-0 flex items-center gap-1 pb-px"
                style={{ color: PROMO_ORANGE }}
              >
                <span aria-hidden>🏆</span> Where do you rank?
              </p>
              <p className="text-[13px] font-extrabold text-homeInk leading-tight m-0">
                Find out. Don&apos;t lose your progress.
              </p>
              <p className="text-[10px] text-homeBodyMuted leading-snug m-0 line-clamp-2">
                75% off AI for Work Course · All modules unlocked
              </p>
            </div>

            <Link
              href={signupHref}
              className="shrink-0 inline-flex items-center justify-center gap-0.5 rounded-full bg-homeInk py-2 px-3.5 text-[11px] font-bold text-amber no-underline hover:opacity-92 transition-opacity whitespace-nowrap"
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
