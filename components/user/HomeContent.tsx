"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock, Loader2, X } from "lucide-react";
import RichText from "@/components/ui/RichText";
import type {
  ApplyVideo,
  Coupon,
  HomeBriefHero,
  Module,
  ModuleScreen,
  NewsItem,
  ProductOfDay,
  WatchVideo,
  World,
} from "@/lib/types";
import CouponBanner from "@/components/user/CouponBanner";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";
import { track } from "@/lib/analytics";
import { getModuleWithScreens } from "@/app/actions/getModule";
import ModulePlayer from "@/components/user/ModulePlayer";
import { ApplyVideoDetailModal } from "@/components/user/ApplyVideosFeed";
import { GuestAccountMobileStrip } from "@/components/user/GuestAccountPromo";
import { UserPointsMobileStrip } from "@/components/user/UserPointsCard";
import { MAIN_WEBSITE_ORIGIN, PRIVACY_CONTACT_EMAIL } from "@/lib/site";
import { DEFAULT_POINTS, useAwardOnClick } from "@/lib/useAwardOnClick";

/** Use UTC so SSR (often UTC) and the browser agree — default locale TZ caused hydration mismatches. */
function formatBriefDateUtc(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

const VIDEO_AVATAR_COLORS = ["#ED4551", "#623CEA", "#F68A29", "#3696FC", "#23CE68", "#FFCE00"];

const HERO_FALLBACK = {
  badge_label: "NUDGEABLE BRIEF",
  title: "What changed in AI — fast",
  subtitle:
    "Three headlines worth your attention — curated, plain English, links when you want more.",
};

/** Warm orange-red used for section labels and CTAs (reference UI). */
const HOME_SECTION_ORANGE = "#E64A19";

/** Rotating full-bleed backgrounds for “Products of the week” cards (reference UI). */
const PRODUCT_WEEK_CARD_THEMES = [
  "linear-gradient(165deg, #7c5cf0 0%, #5d3fd3 42%, #4a32c4 100%)",
  "linear-gradient(165deg, #2d7a5e 0%, #1b4d3e 48%, #143d32 100%)",
  "linear-gradient(165deg, #2563ab 0%, #1e4d8c 50%, #163d70 100%)",
  "linear-gradient(165deg, #a8466f 0%, #8b3a5c 50%, #6d2e49 100%)",
  "linear-gradient(165deg, #c45f2a 0%, #a34d22 50%, #823d1c 100%)",
  "linear-gradient(165deg, #5c4a8f 0%, #453673 50%, #36295c 100%)",
  "linear-gradient(165deg, #2f6b8f 0%, #245574 50%, #1c445d 100%)",
] as const;

// ─── Shared auto-scroll carousel hook ────────────────────────────────────────

function useCarousel(count: number, intervalMs = 4500) {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const scrollPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Ignore scroll-driven index updates while we animate programmatically (arrows / timer). */
  const scrollSyncSuppressedUntilRef = useRef(0);
  /** If index changed because the user dragged the track, don't run scroll-into-view (prevents fighting). */
  const idxChangeSourceRef = useRef<"external" | "scroll">("external");

  const suppressScrollSync = useCallback((ms = 700) => {
    scrollSyncSuppressedUntilRef.current = Date.now() + ms;
  }, []);

  function scrollTrackToCard(track: HTMLDivElement, index: number, behavior: ScrollBehavior) {
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const target = Math.max(0, card.offsetLeft - padLeft);
    track.scrollTo({ left: target, behavior });
  }

  // Scroll track to active card when index changes from arrows / timer / goTo — not from user drag.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;

    if (idxChangeSourceRef.current === "scroll") {
      idxChangeSourceRef.current = "external";
      return;
    }

    suppressScrollSync(750);
    requestAnimationFrame(() => {
      scrollTrackToCard(track, activeIdx, "smooth");
    });
  }, [activeIdx, count, suppressScrollSync]);

  // Auto-advance timer
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        idxChangeSourceRef.current = "external";
        suppressScrollSync(750);
        setActiveIdx((p) => (p + 1) % count);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs, suppressScrollSync]);

  // Keep highlighted index in sync when the user swipes / drags the track
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;
    let raf = 0;
    const onScroll = () => {
      pausedRef.current = true;
      if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
      scrollPauseTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, 3800);

      if (Date.now() < scrollSyncSuppressedUntilRef.current) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = [...track.children] as HTMLElement[];
        if (!children.length) return;
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        children.forEach((el, i) => {
          const mid = el.offsetLeft + el.offsetWidth / 2;
          const d = Math.abs(mid - center);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        idxChangeSourceRef.current = "scroll";
        setActiveIdx(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      if (scrollPauseTimerRef.current) clearTimeout(scrollPauseTimerRef.current);
      track.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const pauseFor = useCallback((ms: number) => {
    pausedRef.current = true;
    setTimeout(() => {
      pausedRef.current = false;
    }, ms);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(count - 1, i));
      idxChangeSourceRef.current = "external";
      suppressScrollSync(750);
      setActiveIdx(next);
      pausedRef.current = true;
      setTimeout(() => {
        pausedRef.current = false;
      }, 4500);
    },
    [count, suppressScrollSync]
  );

  const step = useCallback(
    (delta: number) => {
      idxChangeSourceRef.current = "external";
      suppressScrollSync(750);
      setActiveIdx((p) => Math.max(0, Math.min(count - 1, p + delta)));
      pausedRef.current = true;
      setTimeout(() => {
        pausedRef.current = false;
      }, 4500);
    },
    [count, suppressScrollSync]
  );

  return { activeIdx, trackRef, pause, resume, pauseFor, goTo, step };
}

function HomeSectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1 px-0">
      <p
        className="text-[11px] font-bold tracking-[0.14em] uppercase m-0"
        style={{ color: HOME_SECTION_ORANGE }}
      >
        {label}
      </p>
      <h2 className="text-[22px] sm:text-2xl font-extrabold text-homeInk tracking-tight leading-tight m-0">
        {title}
      </h2>
      <p className="text-[14px] text-homeBodyMuted leading-snug m-0 mt-0.5">{subtitle}</p>
    </div>
  );
}

function CarouselStatusPill({
  activeIdx,
  total,
  hint,
}: {
  activeIdx: number;
  total: number;
  hint: "swipe" | "drag";
}) {
  const cur = String(activeIdx + 1).padStart(2, "0");
  const cap = String(total).padStart(2, "0");
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold tabular-nums bg-[#1A1A1A] text-white/90 shadow-sm"
      aria-live="polite"
    >
      <span className="text-amber">{cur}</span>
      <span className="text-white/75">{` / ${cap}`}</span>
      <span className="text-white/35 px-0.5">·</span>
      <span className="text-white/80 font-medium">{hint}</span>
    </div>
  );
}

function CarouselSectionFooter({
  activeIdx,
  total,
  hint,
  linkHref,
  linkLabel,
}: {
  activeIdx: number;
  total: number;
  hint: "swipe" | "drag";
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mt-3 px-0">
      <CarouselStatusPill activeIdx={activeIdx} total={total} hint={hint} />
      <Link
        href={linkHref}
        className="shrink-0 text-[13px] font-semibold no-underline hover:opacity-85 transition-opacity"
        style={{ color: HOME_SECTION_ORANGE }}
        onClick={() => track("link_click", { title: linkLabel, url: linkHref })}
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function CarouselArrowNav({
  show,
  onPrev,
  onNext,
  ariaPrev,
  ariaNext,
}: {
  show: boolean;
  onPrev: () => void;
  onNext: () => void;
  ariaPrev: string;
  ariaNext: string;
}) {
  if (!show) return null;
  const btn =
    "absolute top-1/2 z-[2] -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white text-homeInk shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-black/[0.06] hover:bg-[#fafafa] transition-colors";
  return (
    <>
      <button type="button" className={`${btn} left-0 -translate-x-1`} aria-label={ariaPrev} onClick={onPrev}>
        <ChevronLeft size={20} strokeWidth={2.25} />
      </button>
      <button type="button" className={`${btn} right-0 translate-x-1`} aria-label={ariaNext} onClick={onNext}>
        <ChevronRight size={20} strokeWidth={2.25} />
      </button>
    </>
  );
}

function estimateWorldMinutes(moduleCount: number): number {
  if (moduleCount <= 0) return 0;
  return Math.max(3, Math.round(moduleCount * (14 / 3)));
}

function worldsFundamentalsSubtitle(worlds: World[], modules: Module[]): string {
  const nWorlds = worlds.length;
  if (!nWorlds) return "";
  const worldIds = new Set(worlds.map((w) => w.id));
  const nMods = modules.filter((m) => worldIds.has(m.world_id)).length;
  const wLabel = nWorlds === 1 ? "world" : "worlds";
  const mLabel = nMods === 1 ? "module" : "modules";
  return `${nMods} ${mLabel} · ~60 sec each`;
}

function useCarouselInteractionHint(): "swipe" | "drag" {
  const [hint, setHint] = useState<"swipe" | "drag">("swipe");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setHint(mq.matches ? "drag" : "swipe");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return hint;
}

// ─── Main HomeContent ─────────────────────────────────────────────────────────

export default function HomeContent({
  briefNews,
  briefHero,
  products,
  libraryVideos,
  worlds,
  modules,
  applyMidVideos,
  applyVideosTotal,
  displayName,
  isLoggedIn = false,
  points = 0,
  streak = 0,
  coupon,
}: {
  briefNews: NewsItem[];
  briefHero: HomeBriefHero | null;
  products: ProductOfDay[];
  libraryVideos: WatchVideo[];
  worlds: World[];
  modules: Module[];
  applyMidVideos: ApplyVideo[];
  applyVideosTotal: number;
  displayName?: string | null;
  isLoggedIn?: boolean;
  /** `profiles.xp` for the signed-in viewer; drives the mobile points strip. */
  points?: number;
  /** `profiles.streak` for the signed-in viewer; secondary stat on the mobile strip. */
  streak?: number;
  coupon?: Coupon | null;
}) {
  const showBriefHero = briefNews.length > 0 || !!briefHero;
  const heroBadge = briefHero?.badge_label?.trim() || HERO_FALLBACK.badge_label;
  const heroTitle = briefHero?.title?.trim() || HERO_FALLBACK.title;
  const heroSubtitle = briefHero?.subtitle?.trim() || HERO_FALLBACK.subtitle;
  const bylineOverride = briefHero?.byline_override?.trim();
  const todayByline = formatBriefDateUtc(new Date().toISOString());
  const heroByline = bylineOverride || todayByline;

  return (
    <div className="space-y-10 md:space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-[1.65rem] font-extrabold text-homeInk tracking-tight">
            {displayName ? (
              <>Hi <span className="text-homeClay">{displayName}</span>, welcome back</>
            ) : "Welcome back"}
          </h1>
          <p className="text-[15px] leading-relaxed text-homeBodyMuted max-w-xl text-pretty">
            {"Here's what's happening in AI — and everything you need to get fluent."}
          </p>
        </div>
      </header>

      {/* Coupon — logged-in users only. Top banner until dismissed; sidebar strip after. */}
      {isLoggedIn && coupon && <CouponBanner coupon={coupon} className="!mt-3 md:!mt-4" />}

      {/* Nudgeable Brief hero */}
      {showBriefHero && (
        <section aria-labelledby="brief-hero-heading" className="!mt-3 md:!mt-4">
          <div className="rounded-2xl border border-homeInk/10 shadow-md overflow-hidden bg-homeInk px-5 pt-2 pb-6 md:px-8 md:pt-8 md:pb-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">
                {heroBadge}
              </span>
              <span className="text-[12px] text-homeWarmGray">{heroByline}</span>
            </div>
            <h2
              id="brief-hero-heading"
              className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight"
            >
              {heroTitle}
            </h2>

            {briefNews.length > 0 ? (
              <ul className="mt-4 space-y-3 list-none">
                {briefNews.map((n) => (
                  <BriefNewsItem key={n.id} item={n} isLoggedIn={isLoggedIn} />
                ))}
              </ul>
            ) : (
              <RichText
                content={heroSubtitle}
                classes={{
                  wrapper: "mt-3 max-w-2xl space-y-2",
                  p: "text-sm text-homeWarmGray leading-relaxed",
                  ul: "space-y-1.5 list-none",
                  li: "flex items-start gap-2 text-sm text-homeWarmGray leading-relaxed",
                  bullet: "shrink-0 text-homeClay mt-0.5 text-base leading-none",
                  strong: "font-bold text-white",
                  em: "italic",
                  code: "font-mono text-[12px] bg-white/10 text-amber px-1.5 py-0.5 rounded",
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* Worlds horizontal auto-scroll carousel */}
      {worlds.length > 0 && (
        <WorldsCarousel worlds={worlds} modules={modules} isLoggedIn={isLoggedIn} />
      )}

      {/* Apply videos horizontal auto-scroll carousel */}
      {applyMidVideos.length > 0 && (
        <ApplyVideosCarousel
          videos={applyMidVideos}
          applyVideosTotal={applyVideosTotal}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Products horizontal auto-scroll carousel */}
      {products.length > 0 && <ProductsCarousel products={products} />}

      {/* Watch this week */}
      {libraryVideos.length > 0 && (
        <section>
          <div className="rounded-xl bg-white border border-homeShellLine px-5 py-[18px] shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-bold text-homeInk">Watch this week</span>
              <Link
                href="/insights"
                className="text-xs font-semibold text-homeClay hover:underline inline-flex items-center gap-0.5 no-underline"
              >
                All videos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {libraryVideos.slice(0, 4).map((v) => (
                <WatchWeekThumb key={v.id} video={v} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discovery cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 pt-2">
        <HomeDiscoveryCard
          href="/learn?tab=resources"
          emoji="📚"
          title="Learning Resources"
          description="Curated courses from Anthropic, OpenAI, Google — organised by level."
          cta="Browse resources →"
          accent="green"
        />
        <HomeDiscoveryCard
          href="/tools"
          emoji="🔧"
          title="Popular AI Tools"
          description="Vetted picks with honest pros, cons, and who they're best for."
          cta="Explore tools →"
          accent="navy"
        />
        <HomeDiscoveryCard
          href="/learn?tab=glossary"
          emoji="📖"
          title="AI Glossary"
          description="Every AI term you'll encounter — defined simply, searchable A–Z."
          cta="Open glossary →"
          accent="purple"
        />
      </section>

      <footer className="pt-8 mt-4 border-t border-homeInk/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px] text-homeBodyMuted">
          <p>© {new Date().getFullYear()} Nudgeable AI. All rights reserved.</p>
          <nav
            aria-label="Site and legal"
            className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-5 gap-y-2 text-[13px] text-homeBodyMuted"
          >
            <span>
              Contact us at{" "}
              <a
                href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                className="font-semibold text-homeInk hover:underline underline-offset-2"
                onClick={() =>
                  track("link_click", {
                    title: "Contact us",
                    url: `mailto:${PRIVACY_CONTACT_EMAIL}`,
                  })
                }
              >
                {PRIVACY_CONTACT_EMAIL}
              </a>
            </span>
            <span>
              More about us at{" "}
              <a
                href={MAIN_WEBSITE_ORIGIN}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-homeInk hover:underline underline-offset-2"
                onClick={() =>
                  track("link_click", { title: "More about us", url: MAIN_WEBSITE_ORIGIN })
                }
              >
                nudgeable.ai
              </a>
            </span>
            <Link
              href="/privacy"
              className="font-semibold text-homeInk hover:underline underline-offset-2 sm:shrink-0"
              onClick={() => track("link_click", { title: "Privacy policy", url: "/privacy" })}
            >
              Privacy policy
            </Link>
          </nav>
        </div>
      </footer>

      {/* Fixed mobile banner above the tab bar — guest promo for visitors, points strip for logged-in users. */}
      {isLoggedIn ? (
        <UserPointsMobileStrip
          points={points}
          streak={streak}
          displayName={displayName}
        />
      ) : (
        <GuestAccountMobileStrip />
      )}
    </div>
  );
}

// ─── Worlds carousel ──────────────────────────────────────────────────────────

function WorldsCarousel({
  worlds,
  modules,
  isLoggedIn,
}: {
  worlds: World[];
  modules: Module[];
  isLoggedIn: boolean;
}) {
  const hint = useCarouselInteractionHint();
  const { activeIdx, trackRef, pause, resume, pauseFor, goTo, step } = useCarousel(worlds.length);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [playerData, setPlayerData] = useState<{
    module: Module;
    screens: ModuleScreen[];
  } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleOpenModule(m: Module) {
    const moduleLocked = m.is_locked && !isLoggedIn;
    if (moduleLocked || loadingId) return;
    setLoadingId(m.id);
    const data = await getModuleWithScreens(m.id);
    setLoadingId(null);
    if (data) setPlayerData(data);
  }

  function handleSelectWorld(world: World, i: number) {
    goTo(i);
    setSelectedWorld((prev) => (prev?.id === world.id ? null : world));
  }

  const worldModules = selectedWorld
    ? modules.filter((m) => m.world_id === selectedWorld.id)
    : [];

  return (
    <section className="space-y-3">
      <HomeSectionHeader
        label="Learn"
        title="AI Foundations"
        subtitle={worldsFundamentalsSubtitle(worlds, modules)}
      />

      <div
        className="relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={() => pauseFor(4000)}
      >
        <CarouselArrowNav
          show={worlds.length > 1}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          ariaPrev="Previous world"
          ariaNext="Next world"
        />
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto pb-1 scroll-pl-4 scroll-pr-4 pl-4 pr-4 md:scroll-pl-0 md:scroll-pr-0 md:pl-0 md:pr-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {worlds.map((w, i) => {
            const wMods = modules.filter((m) => m.world_id === w.id);
            const modCount = wMods.length;
            const mins = estimateWorldMinutes(modCount);
            const isSelected = selectedWorld?.id === w.id;
            const metaColor = w.color;
            const worldLocked = w.is_locked && !isLoggedIn;
            return (
              <button
                key={w.id}
                type="button"
                onClick={worldLocked ? undefined : () => handleSelectWorld(w, i)}
                disabled={worldLocked}
                className={`flex-shrink-0 flex items-center gap-3 rounded-[18px] pl-3 pr-3 py-3 text-left transition-[opacity,box-shadow] duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] snap-start ${worldLocked
                  ? "cursor-default opacity-45 hover:opacity-55"
                  : `cursor-pointer ${activeIdx === i ? "opacity-100" : "opacity-[0.88] hover:opacity-100"}`
                  }`}
                style={{
                  width: "min(300px, calc(100vw - 3rem))",
                  borderTopWidth: 3,
                  borderLeftWidth: 3,
                  borderBottomWidth: 0,
                  borderRightWidth: 0,
                  borderStyle: "solid",
                  borderColor: w.color,
                  backgroundColor: `${w.color}14`,
                  boxShadow: isSelected ? `0 0 0 2px ${w.color}, 0 6px 18px ${w.color}22` : undefined,
                }}
              >
                <div
                  className="relative w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
                  style={{
                    background: `${w.color}22`,
                    border: `2px solid ${w.color}44`,
                  }}
                  aria-hidden
                >
                  {w.emoji}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="text-[14px] font-bold text-homeInk leading-snug line-clamp-2">{w.title}</div>
                  <div
                    className="text-[12px] font-semibold mt-1"
                    style={{ color: metaColor }}
                  >
                    {worldLocked
                      ? "Login to unlock"
                      : `${modCount} module${modCount !== 1 ? "s" : ""} · ${mins} min`}
                  </div>
                </div>
                <div
                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-inner"
                  style={
                    worldLocked
                      ? { backgroundColor: "#1c1814", color: "#FFCE00" }
                      : { backgroundColor: w.color, color: "#ffffff" }
                  }
                  aria-hidden
                >
                  {worldLocked ? (
                    <Lock size={20} strokeWidth={2.75} />
                  ) : (
                    <ChevronRight size={22} strokeWidth={2.5} className="-mr-px" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <CarouselSectionFooter
          activeIdx={activeIdx}
          total={worlds.length}
          hint={hint}
          linkHref="/learn"
          linkLabel="See all →"
        />
      </div>

      {/* Expanded modules panel */}
      {selectedWorld && (
        <div
          className="mt-4 rounded-xl border px-4 py-4"
          style={{
            borderColor: `${selectedWorld.color}28`,
            background: `${selectedWorld.color}05`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{selectedWorld.emoji}</span>
              <span className="text-[14px] font-extrabold text-homeInk">{selectedWorld.title}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `${selectedWorld.color}18`,
                  color: selectedWorld.color,
                }}
              >
                {worldModules.length} module{worldModules.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedWorld(null)}
              className="p-1 rounded-lg text-homeSubtle hover:text-homeInk transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col">
            {worldModules.map((m, idx) => {
              const locked = m.is_locked && !isLoggedIn;
              const loading = loadingId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleOpenModule(m)}
                  disabled={locked || !!loadingId}
                  className={`w-full flex gap-3 items-start py-2.5 rounded-xl px-2 -mx-2 text-left transition group
                    ${locked ? "cursor-not-allowed opacity-55" : loading ? "cursor-wait" : "hover:bg-white/60 cursor-pointer"}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-black"
                    style={
                      locked
                        ? {
                          background: "rgba(34,29,35,0.07)",
                          color: "#9e8e7a",
                          border: "1.5px solid rgba(34,29,35,0.12)",
                        }
                        : {
                          background: `${selectedWorld.color}18`,
                          color: selectedWorld.color,
                          border: `1.5px solid ${selectedWorld.color}35`,
                        }
                    }
                  >
                    {locked ? <Lock size={10} strokeWidth={2.5} /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-[13px] font-bold leading-tight ${locked ? "text-homeSubtle" : "text-homeInk"
                        }`}
                    >
                      {m.title}
                    </span>
                    {m.concepts && m.concepts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {m.concepts.slice(0, 3).map((c, ci) => (
                          <span
                            key={ci}
                            className="text-[10px] text-homeSubtle/80 bg-homeInk/5 px-1.5 py-0.5 rounded-md font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {locked ? (
                    <Lock size={12} className="text-homeSubtle/40 shrink-0 mt-1" />
                  ) : loading ? (
                    <Loader2
                      size={13}
                      className="shrink-0 mt-1 animate-spin"
                      style={{ color: selectedWorld.color }}
                    />
                  ) : (
                    <ChevronRight
                      size={13}
                      className="text-homeSubtle/50 shrink-0 mt-1 group-hover:text-homeInk group-hover:translate-x-0.5 transition"
                    />
                  )}
                </button>
              );
            })}
            {worldModules.length === 0 && (
              <div className="text-xs text-homeSubtle py-2 px-2">No modules yet.</div>
            )}
          </div>
        </div>
      )}

      {playerData && (
        <ModulePlayer
          module={playerData.module}
          screens={playerData.screens}
          onClose={() => setPlayerData(null)}
        />
      )}
    </section>
  );
}

// ─── Apply videos carousel ────────────────────────────────────────────────────

function ApplyVideosCarousel({
  videos,
  applyVideosTotal,
  isLoggedIn,
}: {
  videos: ApplyVideo[];
  applyVideosTotal: number;
  isLoggedIn: boolean;
}) {
  const hint = useCarouselInteractionHint();
  const { activeIdx, trackRef, pause, resume, pauseFor, goTo, step } = useCarousel(videos.length);
  const [modalVideo, setModalVideo] = useState<ApplyVideo | null>(null);
  const totalLabel = Math.max(applyVideosTotal, videos.length);

  return (
    <section className="space-y-3">
      <HomeSectionHeader
        label="Apply"
        title="What can AI do?"
        subtitle={"Most useful and common features across chatbots"}
      />

      <div
        className="relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={() => pauseFor(4000)}
      >
        <CarouselArrowNav
          show={videos.length > 1}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          ariaPrev="Previous feature"
          ariaNext="Next feature"
        />
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto pb-1 scroll-pl-4 scroll-pr-4 pl-4 pr-4 md:scroll-pl-0 md:scroll-pr-0 md:pl-0 md:pr-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {videos.map((v, i) => {
            const accent = featureAccent(v.group_name);
            const thumb = resolveVideoThumbnailUrl(v.thumbnail_url, v.video_url);
            const blurb = applyVideoBlurb(v.description);
            const cat = (v.category_tag || "Feature").trim();
            const durationLabel = v.duration?.trim() || "0:30";
            const locked = v.is_locked && !isLoggedIn;
            return (
              <button
                key={v.id}
                type="button"
                disabled={locked}
                onClick={locked ? undefined : () => {
                  setModalVideo(v);
                  goTo(i);
                  pauseFor(4000);
                  track("apply_click", { item_id: v.id, title: v.title });
                }}
                className={`flex-shrink-0 w-[min(268px,calc(100vw-3rem))] overflow-hidden rounded-[18px] border border-black/[0.06] bg-white text-left transition-opacity duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] snap-start flex flex-col ${locked ? "opacity-60 cursor-default" : `cursor-pointer ${i === activeIdx ? "opacity-100" : "opacity-[0.9] hover:opacity-100"}`}`}
              >
                <div
                  className="relative h-[132px] w-full shrink-0 overflow-hidden"
                  style={{
                    background: thumb
                      ? undefined
                      : `linear-gradient(155deg, ${accent} 0%, #1a1030 48%, #0f0a18 100%)`,
                  }}
                >
                  {thumb ? (
                    <>
                      <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25"
                        aria-hidden
                      />
                    </>
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {locked ? (
                      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                        <Lock size={20} className="text-white/80" />
                      </div>
                    ) : (
                      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
                        <span className="text-homeInk text-[18px] leading-none pl-1" aria-hidden>
                          ▶
                        </span>
                      </div>
                    )}
                  </div>
                  {!locked && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-px font-mono text-[11px] font-medium text-white tabular-nums">
                      {durationLabel}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 px-3.5 pt-3 pb-3.5 bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    />
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-homeBodyMuted truncate">
                      {locked ? "Locked" : cat}
                    </span>
                  </div>
                  <div className="text-[15px] font-bold text-homeInk leading-snug">{v.title}</div>
                  {locked ? (
                    <p className="text-[12px] text-homeBodyMuted leading-relaxed italic">Login to unlock</p>
                  ) : blurb ? (
                    <p className="text-[12px] text-homeBodyMuted leading-relaxed line-clamp-2">{blurb}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <CarouselSectionFooter
          activeIdx={activeIdx}
          total={totalLabel}
          hint={hint}
          linkHref="/apply"
          linkLabel="See all features →"
        />
      </div>

      {modalVideo && (
        <ApplyVideoDetailModal video={modalVideo} onClose={() => setModalVideo(null)} />
      )}
    </section>
  );
}

// ─── Products carousel ────────────────────────────────────────────────────────

function productWeekByline(tagline: string | undefined | null): string | null {
  const t = tagline?.trim();
  if (!t) return null;
  if (/^by\s+/i.test(t)) return t;
  return `by ${t}`;
}

function ProductsCarousel({ products }: { products: ProductOfDay[] }) {
  const hint = useCarouselInteractionHint();
  const { activeIdx, trackRef, pause, resume, pauseFor } = useCarousel(products.length);

  return (
    <section className="space-y-3">
      <HomeSectionHeader
        label="This week"
        title="Products of the week"
        subtitle={"Best in their categories"}
      />

      <div
        className="relative"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={() => pauseFor(4000)}
      >
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto py-2 scroll-pl-4 scroll-pr-4 pl-4 pr-4 md:scroll-pl-0 md:scroll-pr-0 md:pl-0 md:pr-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {products.map((p, i) => {
            const href = p.url || "/tools";
            const theme =
              PRODUCT_WEEK_CARD_THEMES[i % PRODUCT_WEEK_CARD_THEMES.length] ?? PRODUCT_WEEK_CARD_THEMES[0];
            const ribbon = i === 0 ? "PRODUCT OF THE WEEK" : "NEW THIS WEEK";
            const byline = productWeekByline(p.tagline);
            return (
              <a
                key={p.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track("product_click", { item_id: p.id, title: p.name, url: href });
                  pauseFor(4000);
                }}
                className={`flex-shrink-0 flex flex-col w-[min(292px,calc(100vw-3rem))] min-h-[218px] rounded-[22px] overflow-hidden no-underline shadow-[0_10px_36px_rgba(34,29,35,0.14)] snap-start transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(34,29,35,0.18)] ${i === activeIdx ? "opacity-100" : "opacity-[0.92] hover:opacity-100"
                  }`}
                style={{ background: theme }}
              >
                <div className="px-3.5 pt-2.5 pb-px flex items-center gap-1.5">
                  <span className="text-amber text-[10px] font-black tracking-[0.12em] shrink-0">—</span>
                  <span className="text-amber text-[10px] font-black tracking-[0.14em] uppercase leading-tight">
                    {ribbon}
                  </span>
                </div>

                <div className="px-3.5 pt-1 flex items-start gap-2">
                  <div
                    className="w-[40px] h-[40px] rounded-[11px] shrink-0 flex items-center justify-center overflow-hidden border border-white/25 shadow-inner"
                    style={{
                      background: "linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 100%)",
                    }}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[19px] leading-none drop-shadow-sm" aria-hidden>
                        ✨
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-px">
                    <div className="text-[16px] font-extrabold text-white leading-snug tracking-tight line-clamp-2">
                      {p.name}
                    </div>
                  </div>
                </div>

                <p className="flex-1 px-3.5 pt-1.5 text-[11.5px] leading-snug text-white/[0.92] line-clamp-3">
                  {p.description}
                </p>

                <div className="mt-auto px-3.5 pt-1 pb-3 flex flex-col gap-1.5">
                  {byline ? (
                    <span className="text-[10px] font-medium text-white/75">{byline}</span>
                  ) : null}
                  <span className="inline-flex self-start items-center rounded-full bg-amber px-3 py-1 text-[10px] font-extrabold text-homeInk shadow-[0_4px_16px_rgba(255,206,0,0.35)]">
                    Try it →
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <CarouselSectionFooter
          activeIdx={activeIdx}
          total={products.length}
          hint={hint}
          linkHref="/tools"
          linkLabel="All this week →"
        />
      </div>
    </section>
  );
}

// ─── Nudgeable Brief news item ─────────────────────────────────────────────────

// Single brief-list row. Lives in its own component so we can `useAwardOnClick`
// per news item (hooks can't be called inside `.map(() => ...)`).
function BriefNewsItem({ item: n, isLoggedIn }: { item: NewsItem; isLoggedIn: boolean }) {
  const href = n.url || null;
  const briefText = n.brief?.trim() || n.body?.trim() || null;
  const awardOnClick = useAwardOnClick({
    sourceType: "news",
    sourceId: n.id,
    pointsAward: n.points_award,
    defaultPoints: DEFAULT_POINTS.news,
    isLoggedIn,
  });

  if (n.is_locked) {
    return (
      <li>
        <div className="flex gap-2.5 items-start opacity-50">
          <Lock size={12} className="shrink-0 mt-[5px] text-homeClay/60" aria-hidden />
          <p className="text-[13px] text-homeWarmGray/70 leading-relaxed italic">
            Login to unlock this update
          </p>
        </div>
      </li>
    );
  }

  return (
    <li>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-2.5 items-start group no-underline"
          onClick={() => {
            awardOnClick();
            track("news_click", { item_id: n.id, title: n.title, url: href });
          }}
        >
          <span className="shrink-0 mt-[7px] h-1.5 w-1.5 rounded-full bg-homeClay group-hover:bg-amber transition-colors" aria-hidden />
          <p className="text-[13px] text-homeWarmGray leading-relaxed group-hover:text-white/90 transition-colors">
            {briefText || n.title}
          </p>
        </a>
      ) : (
        <div className="flex gap-2.5 items-start">
          <span className="shrink-0 mt-[7px] h-1.5 w-1.5 rounded-full bg-homeClay" aria-hidden />
          <p className="text-[13px] text-homeWarmGray leading-relaxed">
            {briefText || n.title}
          </p>
        </div>
      )}
    </li>
  );
}

// ─── Watch this week thumb ─────────────────────────────────────────────────────

function WatchWeekThumb({ video, isLoggedIn }: { video: WatchVideo; isLoggedIn: boolean }) {
  const thumb = resolveVideoThumbnailUrl(video.thumbnail_url, video.url);
  const href = video.url || "#";
  const creatorColor =
    VIDEO_AVATAR_COLORS[(video.creator?.charCodeAt(0) || 0) % VIDEO_AVATAR_COLORS.length];
  const letter = video.creator?.[0]?.toUpperCase() || "?";
  const awardOnClick = useAwardOnClick({
    sourceType: "video",
    sourceId: video.id,
    pointsAward: video.points_award,
    defaultPoints: DEFAULT_POINTS.video,
    isLoggedIn,
  });

  if (video.is_locked) {
    return (
      <div className="flex min-w-0 w-full flex-col overflow-hidden rounded-[10px] bg-homeInk shadow-[0_2px_8px_rgba(0,0,0,0.15)] opacity-60 cursor-default">
        <div
          className="relative flex h-[90px] w-full flex-shrink-0 items-center justify-center overflow-hidden"
          style={thumb ? undefined : { background: `linear-gradient(135deg, ${creatorColor}22, #1c1814)` }}
        >
          {thumb ? (
            <>
              <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-black/40" />
            </>
          ) : null}
          <div className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-white/10" aria-hidden>
            <Lock size={14} className="text-white/70" />
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="mb-1 truncate text-[11px] text-homeVideoMeta">{video.creator || "Nudgeable"}</div>
          <div className="line-clamp-2 text-xs font-semibold leading-snug text-homeDivider">{video.title}</div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 w-full flex-col overflow-hidden rounded-[10px] bg-homeInk shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] no-underline"
      onClick={() => {
        awardOnClick();
        track("video_click", { item_id: video.id, title: video.title, creator: video.creator });
      }}
    >
      <div
        className="relative flex h-[90px] w-full flex-shrink-0 items-center justify-center overflow-hidden"
        style={
          thumb ? undefined : { background: `linear-gradient(135deg, ${creatorColor}22, #1c1814)` }
        }
      >
        {thumb ? (
          <>
            <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
          </>
        ) : null}
        <div
          className="relative z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.15] backdrop-blur-[4px] transition-colors group-hover:bg-homeClay"
          aria-hidden
        >
          <span className="pl-[2px] text-[11px] leading-none text-white">▶</span>
        </div>
        {video.duration ? (
          <div className="absolute bottom-[5px] right-[7px] rounded-[3px] bg-black/70 px-[5px] py-px font-mono text-[10px] leading-tight text-white">
            {video.duration}
          </div>
        ) : null}
        <div
          className="absolute left-2 top-[7px] flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: creatorColor }}
        >
          {letter}
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="mb-1 truncate text-[11px] text-homeVideoMeta">{video.creator || "Nudgeable"}</div>
        <div className="line-clamp-2 text-xs font-semibold leading-snug text-homeDivider">{video.title}</div>
      </div>
    </a>
  );
}

// ─── Discovery card ────────────────────────────────────────────────────────────

function HomeDiscoveryCard({
  href,
  emoji,
  title,
  description,
  cta,
  accent,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
  cta: string;
  accent: "green" | "navy" | "purple";
}) {
  const surface =
    accent === "green"
      ? "bg-homeCtaGreen border-homeCtaGreen"
      : accent === "navy"
        ? "bg-homeCtaNavy border-homeCtaNavy"
        : "bg-homeCtaPurple border-homeCtaPurple";

  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl border border-black/10 shadow-md transition hover:brightness-[1.06] hover:shadow-lg overflow-hidden no-underline h-full min-h-[220px] ${surface}`}
      onClick={() => track("link_click", { title, url: href })}
    >
      <div className="p-6 pb-6 flex flex-col flex-1 text-white">
        <span className="text-[2.35rem] leading-none mb-4 drop-shadow-sm" aria-hidden>
          {emoji}
        </span>
        <h3 className="text-lg font-extrabold text-white tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-white/85 leading-relaxed flex-1">{description}</p>
        <span className="mt-5 text-sm font-bold text-white group-hover:underline decoration-white/70 underline-offset-2">
          {cta}
        </span>
      </div>
    </Link>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function applyVideoBlurb(description: string | null | undefined): string {
  if (!description?.trim()) return "";
  const cleaned = description.replace(/\n*\[seed:ai-features-guide-v1]\s*$/i, "").trim();
  const line = cleaned.split(/\n+/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  return line.length > 96 ? `${line.slice(0, 94)}…` : line;
}

const GROUP_COLORS: Record<string, string> = {
  Features: "#A855F7",
  Apps: "#EC4899",
  Workflows: "#F68A29",
  Skills: "#3699FC",
};

function featureAccent(group: string | null | undefined): string {
  const g = (group || "").trim();
  return GROUP_COLORS[g] || "#623CEA";
}
