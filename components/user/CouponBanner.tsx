"use client";

import { useEffect, useState } from "react";
import type { Coupon } from "@/lib/types";

const COURSE_URL = "https://nudgeable.ai/ai-mastery-course";
const DISMISS_EVENT = "nudgeable:coupon-dismissed";
const dismissKey = (id: string) => `nudgeable_coupon_dismissed_${id}`;

function useCopyCode(code: string) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(code).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return { copied, copy };
}

// Shared dismissed-state for the coupon. The top banner (feed) and the sidebar
// strip both consume this hook, so dismissing the banner immediately reveals
// the sidebar strip without a refresh — and a sibling tab dismissing the coupon
// is picked up via the browser's `storage` event.
function useCouponDismissed(couponId: string) {
  const key = dismissKey(couponId);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(key) === "1");

    function sync() {
      setDismissed(localStorage.getItem(key) === "1");
    }
    function onStorage(e: StorageEvent) {
      if (e.key === key) sync();
    }
    window.addEventListener(DISMISS_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(DISMISS_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  function dismiss() {
    localStorage.setItem(key, "1");
    setDismissed(true);
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }

  return { dismissed, dismiss };
}

// ── Full card — top of the feed (shown until dismissed) ───────────────────────

function CouponCardFull({
  coupon,
  onDismiss,
  className,
}: {
  coupon: Coupon;
  onDismiss: () => void;
  className?: string;
}) {
  const { copied, copy } = useCopyCode(coupon.code);
  const headline = coupon.discount_percent
    ? `${coupon.discount_percent}% off the AI for Work Course`
    : "Exclusive offer — AI for Work Course";

  return (
    <div className={`flex rounded-[14px] border border-homeShellLine bg-white shadow-[0_2px_12px_rgba(34,29,35,0.07)] overflow-hidden${className ? ` ${className}` : ""}`}>
      <div className="w-1 shrink-0 bg-amber" />
      <div className="flex-1 px-[18px] py-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 border border-amber/40 px-2.5 py-0.5 mb-1.5">
              <span className="text-[10px]" aria-hidden>🎁</span>
              <span className="text-[9px] font-bold text-homeInk uppercase tracking-[0.05em]">Welcome offer</span>
            </div>
            <div className="text-[15px] font-extrabold text-homeInk leading-tight tracking-tight">{headline}</div>
            <div className="text-[11px] text-homeBodyMuted mt-0.5">Use your exclusive code at checkout. Limited time.</div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss coupon"
            className="shrink-0 text-homeBodyMuted text-[20px] leading-none bg-transparent border-0 cursor-pointer pl-3 hover:text-homeInk transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-amber/10 border-[1.5px] border-dashed border-amber rounded-lg overflow-hidden">
            <span className="text-[13px] font-black text-homeInk tracking-[0.08em] px-3.5 py-2 font-mono">
              {coupon.code}
            </span>
            <button
              type="button"
              onClick={copy}
              className="text-[10px] font-bold px-3 py-2 border-0 cursor-pointer transition-colors shrink-0 whitespace-nowrap"
              style={{ background: copied ? "#23CE68" : "#FFCE00", color: copied ? "#fff" : "#221D23" }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <a
            href={COURSE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-[#623CEA] no-underline whitespace-nowrap hover:underline"
          >
            View course →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar strip — appears once the top banner is dismissed ──────────────────

export function CouponSidebarStrip({ coupon }: { coupon: Coupon }) {
  const { dismissed } = useCouponDismissed(coupon.id);
  const { copied, copy } = useCopyCode(coupon.code);

  if (!dismissed) return null;

  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: "rgba(255,206,0,0.07)", border: "1px dashed rgba(255,206,0,0.25)" }}
    >
      <div className="text-[8px] font-semibold text-white/30 uppercase tracking-[0.08em] mb-1">AI Mastery Course Discount</div>
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[10px] font-black text-white/60 tracking-[0.06em] font-mono">{coupon.code}</span>
        <div className="flex gap-1.5 items-center">
          <button
            type="button"
            onClick={copy}
            className="text-[9px] font-bold border-0 bg-transparent cursor-pointer p-0 transition-colors"
            style={{ color: copied ? "#23CE68" : "rgba(255,206,0,0.6)" }}
          >
            {copied ? "✓" : "Copy"}
          </button>
          <span className="text-white/10 text-[10px]">|</span>
          <a
            href={COURSE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[9px] font-bold text-white/35 no-underline hover:text-white/60 transition-colors"
          >
            View →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Top banner — shown until the user dismisses it ────────────────────────────

export default function CouponBanner({
  coupon,
  className,
}: {
  coupon: Coupon;
  className?: string;
}) {
  const { dismissed, dismiss } = useCouponDismissed(coupon.id);
  if (dismissed) return null;
  return <CouponCardFull coupon={coupon} onDismiss={dismiss} className={className} />;
}
