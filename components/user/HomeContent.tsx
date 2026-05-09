"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Loader2, X } from "lucide-react";
import RichText from "@/components/ui/RichText";
import type {
  ApplyVideo,
  HomeBriefHero,
  Module,
  ModuleScreen,
  NewsItem,
  ProductOfDay,
  WatchVideo,
  World,
} from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";
import { track } from "@/lib/analytics";
import { getModuleWithScreens } from "@/app/actions/getModule";
import ModulePlayer from "@/components/user/ModulePlayer";
import { ApplyVideoDetailModal } from "@/components/user/ApplyVideosFeed";

function formatBriefDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
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

// ─── Shared auto-scroll carousel hook ────────────────────────────────────────

function useCarousel(count: number, intervalMs = 2000) {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  // Scroll track to active card whenever index changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;
    requestAnimationFrame(() => {
      const card = track.children[activeIdx] as HTMLElement;
      if (card) {
        track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
      }
    });
  }, [activeIdx, count]);

  // Auto-advance timer
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIdx((p) => (p + 1) % count);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs]);

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
      setActiveIdx(i);
      pausedRef.current = true;
      setTimeout(() => {
        pausedRef.current = false;
      }, 4000);
    },
    []
  );

  return { activeIdx, trackRef, pause, resume, pauseFor, goTo };
}

// ─── Dot indicator row ────────────────────────────────────────────────────────

function CarouselDots({
  count,
  activeIdx,
  onGoTo,
}: {
  count: number;
  activeIdx: number;
  onGoTo: (i: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <div className="flex justify-center gap-1.5 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onGoTo(i)}
          aria-label={`Go to item ${i + 1}`}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === activeIdx
              ? "w-5 bg-homeClay"
              : "w-1.5 bg-homeInk/20 hover:bg-homeInk/40"
          }`}
        />
      ))}
    </div>
  );
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
}: {
  briefNews: NewsItem[];
  briefHero: HomeBriefHero | null;
  products: ProductOfDay[];
  libraryVideos: WatchVideo[];
  worlds: World[];
  modules: Module[];
  applyMidVideos: ApplyVideo[];
}) {
  const showBriefHero = briefNews.length > 0 || !!briefHero;
  const heroBadge = briefHero?.badge_label?.trim() || HERO_FALLBACK.badge_label;
  const heroTitle = briefHero?.title?.trim() || HERO_FALLBACK.title;
  const heroSubtitle = briefHero?.subtitle?.trim() || HERO_FALLBACK.subtitle;
  const bylineOverride = briefHero?.byline_override?.trim();
  const todayByline = formatBriefDate(new Date().toISOString());
  const heroByline = bylineOverride || todayByline;

  return (
    <div className="space-y-10 md:space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-[1.65rem] font-extrabold text-homeInk tracking-tight">
            Welcome back
          </h1>
          <p className="text-[15px] leading-relaxed text-homeBodyMuted max-w-xl text-pretty">
            {"Here's what's happening in AI — and everything you need to get fluent."}
          </p>
        </div>
      </header>

      {/* Nudgeable Brief hero */}
      {showBriefHero && (
        <section aria-labelledby="brief-hero-heading">
          <div className="rounded-2xl border border-homeInk/10 shadow-md overflow-hidden bg-homeInk px-5 pt-6 pb-6 md:px-8 md:pt-8 md:pb-7">
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
                {briefNews.map((n) => {
                  const href = n.url || null;
                  const briefText = n.brief?.trim() || n.body?.trim() || null;
                  return (
                    <li key={n.id}>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex gap-2.5 items-start group no-underline"
                          onClick={() => track("news_click", { item_id: n.id, title: n.title, url: href })}
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
                })}
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
      {worlds.length > 0 && <WorldsCarousel worlds={worlds} modules={modules} />}

      {/* Apply videos horizontal auto-scroll carousel */}
      {applyMidVideos.length > 0 && <ApplyVideosCarousel videos={applyMidVideos} />}

      {/* Products horizontal auto-scroll carousel */}
      {products.length > 0 && <ProductsCarousel products={products} />}

      {/* Watch this week */}
      {libraryVideos.length > 0 && (
        <section>
          <div className="rounded-xl bg-white border border-homeShellLine px-5 py-[18px] shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-bold text-homeInk">Watch this week</span>
              <Link
                href="/library"
                className="text-xs font-semibold text-homeClay hover:underline inline-flex items-center gap-0.5 no-underline"
              >
                All videos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {libraryVideos.slice(0, 4).map((v) => (
                <WatchWeekThumb key={v.id} video={v} />
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
    </div>
  );
}

// ─── Worlds carousel ──────────────────────────────────────────────────────────

function WorldsCarousel({ worlds, modules }: { worlds: World[]; modules: Module[] }) {
  const { activeIdx, trackRef, pause, resume, pauseFor, goTo } = useCarousel(worlds.length);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [playerData, setPlayerData] = useState<{
    module: Module;
    screens: ModuleScreen[];
  } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleOpenModule(m: Module) {
    if (m.is_locked || loadingId) return;
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
    <section>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-homeInk">Learn AI worlds</span>
        <Link href="/learn" className="text-xs font-semibold text-homeClay hover:underline no-underline">
          All worlds →
        </Link>
      </div>

      <div onMouseEnter={pause} onMouseLeave={resume} onTouchStart={() => pauseFor(4000)}>
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {worlds.map((w, i) => {
            const wMods = modules.filter((m) => m.world_id === w.id);
            const isSelected = selectedWorld?.id === w.id;
            const isActive = activeIdx === i;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelectWorld(w, i)}
                className={`flex-shrink-0 rounded-xl px-4 py-3.5 text-left cursor-pointer transition-all duration-200
                  ${isActive ? "opacity-100" : "opacity-75 hover:opacity-100"}`}
                style={{
                  scrollSnapAlign: "start",
                  width: "196px",
                  border: isSelected
                    ? `2px solid ${w.color}`
                    : `1.5px solid ${w.color}28`,
                  background: isSelected ? `${w.color}12` : `${w.color}07`,
                  boxShadow: isSelected
                    ? `0 0 0 3px ${w.color}22, 0 4px 16px ${w.color}18`
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5"
                  style={{
                    background: `${w.color}18`,
                    border: `1.5px solid ${w.color}35`,
                  }}
                >
                  {w.emoji}
                </div>
                <div className="text-[13px] font-bold text-homeInk leading-tight">{w.title}</div>
                <div className="text-[10px] font-semibold mt-1" style={{ color: w.color }}>
                  {wMods.length} module{wMods.length !== 1 ? "s" : ""}
                </div>
                {isSelected && (
                  <div className="mt-1.5 flex items-center gap-0.5" style={{ color: w.color }}>
                    <ChevronRight size={9} className="rotate-90" />
                    <span className="text-[9px] font-bold">Open</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <CarouselDots count={worlds.length} activeIdx={activeIdx} onGoTo={goTo} />
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
              const locked = m.is_locked;
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
                      className={`text-[13px] font-bold leading-tight ${
                        locked ? "text-homeSubtle" : "text-homeInk"
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

function ApplyVideosCarousel({ videos }: { videos: ApplyVideo[] }) {
  const { activeIdx, trackRef, pause, resume, pauseFor, goTo } = useCarousel(videos.length);
  const [modalVideo, setModalVideo] = useState<ApplyVideo | null>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-homeInk">Explore AI features</span>
        <Link href="/apply" className="text-xs font-semibold text-homeClay hover:underline no-underline">
          See all →
        </Link>
      </div>

      <div onMouseEnter={pause} onMouseLeave={resume} onTouchStart={() => pauseFor(4000)}>
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {videos.map((v, i) => {
            const accent = featureAccent(v.group_name);
            const tv = tagVariant(v.category_tag);
            const blurb = applyVideoBlurb(v.description);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setModalVideo(v);
                  pauseFor(4000);
                  track("apply_click", { item_id: v.id, title: v.title });
                }}
                className={`flex-shrink-0 rounded-xl border border-[#ece8e0] bg-[#faf8f4] px-4 py-3.5 text-left cursor-pointer transition-all duration-200 flex flex-col
                  ${i === activeIdx ? "opacity-100 shadow-sm" : "opacity-75 hover:opacity-100 hover:shadow-md"}`}
                style={{ scrollSnapAlign: "start", width: "210px" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[19px] mb-2.5"
                  style={{
                    background: `${accent}18`,
                    border: `1.5px solid ${accent}30`,
                  }}
                >
                  {featureIcon(v.title)}
                </div>
                <div className="flex items-start gap-1.5 flex-wrap mb-1.5">
                  <span className="text-[13px] font-bold text-homeInk leading-tight">{v.title}</span>
                  {v.category_tag && (
                    <span
                      className="text-[8px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ background: tv.bg, color: tv.color }}
                    >
                      {v.category_tag}
                    </span>
                  )}
                </div>
                {blurb && (
                  <p className="text-[11px] text-homeSubtle line-clamp-2 leading-relaxed flex-1">
                    {blurb}
                  </p>
                )}
                <div className="mt-3 flex justify-end">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: accent }}
                  >
                    <span className="text-white text-[9px] pl-px font-black">▶</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <CarouselDots count={videos.length} activeIdx={activeIdx} onGoTo={goTo} />
      </div>

      {modalVideo && (
        <ApplyVideoDetailModal video={modalVideo} onClose={() => setModalVideo(null)} />
      )}
    </section>
  );
}

// ─── Products carousel ────────────────────────────────────────────────────────

function ProductsCarousel({ products }: { products: ProductOfDay[] }) {
  const { activeIdx, trackRef, pause, resume, pauseFor, goTo } = useCarousel(products.length);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-homeInk">Product of the week</span>
      </div>

      <div onMouseEnter={pause} onMouseLeave={resume} onTouchStart={() => pauseFor(4000)}>
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((p, i) => {
            const href = p.url || "/tools";
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
                className={`flex-shrink-0 rounded-xl overflow-hidden no-underline transition-all duration-200 cursor-pointer flex flex-col
                  ${i === activeIdx ? "opacity-100" : "opacity-75 hover:opacity-100"}
                  hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(80,30,180,0.30)]`}
                style={{
                  scrollSnapAlign: "start",
                  width: "260px",
                  minHeight: "210px",
                  background:
                    "linear-gradient(145deg,#5B2AB8 0%,#3B1285 55%,#2A0E6A 100%)",
                }}
              >
                <div className="px-4 pt-4 pb-0 flex items-center gap-2">
                  <span className="text-amber text-[10px] font-black tracking-[0.2em]">—</span>
                  <span className="text-amber text-[10px] font-black tracking-[0.16em] uppercase">
                    PRODUCT OF THE WEEK
                  </span>
                </div>

                <div className="px-4 pt-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] shrink-0"
                    style={{
                      background: "rgba(255,206,0,0.18)",
                      border: "1.5px solid rgba(255,206,0,0.35)",
                    }}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-full h-full object-cover rounded-[8px]"
                      />
                    ) : (
                      "✨"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[18px] font-extrabold leading-tight text-white tracking-tight truncate">
                      {p.name}
                    </div>
                  </div>
                </div>

                <p className="flex-1 px-4 pt-2 text-[12px] leading-relaxed text-white/70 line-clamp-2">
                  {p.description}
                </p>

                <div className="px-4 pt-2 pb-4 flex items-center justify-between gap-2 mt-auto">
                  {p.tagline ? (
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-white/80 truncate max-w-[55%]"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      {p.tagline}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    className="shrink-0 text-[12px] font-bold px-3.5 py-1.5 rounded-full"
                    style={{
                      background: "#FFCE00",
                      boxShadow: "0 2px 12px rgba(255,206,0,0.40)",
                    }}
                  >
                    Try it →
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <CarouselDots count={products.length} activeIdx={activeIdx} onGoTo={goTo} />
      </div>
    </section>
  );
}

// ─── Watch this week thumb ─────────────────────────────────────────────────────

function WatchWeekThumb({ video }: { video: WatchVideo }) {
  const thumb = resolveVideoThumbnailUrl(video.thumbnail_url, video.url);
  const href = video.url || "#";
  const creatorColor =
    VIDEO_AVATAR_COLORS[(video.creator?.charCodeAt(0) || 0) % VIDEO_AVATAR_COLORS.length];
  const letter = video.creator?.[0]?.toUpperCase() || "?";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 w-full flex-col overflow-hidden rounded-[10px] bg-homeInk shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] no-underline"
      onClick={() => track("video_click", { item_id: video.id, title: video.title, creator: video.creator })}
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

function featureIcon(title: string | null | undefined): string {
  const t = (title || "").toLowerCase();
  if (t.includes("canvas"))        return "🖊️";
  if (t.includes("gem"))           return "💎";
  if (t.includes("notebook") || t.includes("podcast")) return "🎧";
  if (t.includes("code") || t.includes("codex"))       return "💻";
  if (t.includes("image") || t.includes("dall"))       return "🖼️";
  if (t.includes("voice") || t.includes("audio") || t.includes("speech")) return "🎙️";
  if (t.includes("search") || t.includes("browse"))    return "🔍";
  if (t.includes("summar") || t.includes("tldr"))      return "📋";
  if (t.includes("translat"))      return "🌐";
  if (t.includes("email") || t.includes("write") || t.includes("draft")) return "✉️";
  if (t.includes("chart") || t.includes("data") || t.includes("analys")) return "📊";
  if (t.includes("plan") || t.includes("task") || t.includes("project")) return "📌";
  if (t.includes("present") || t.includes("slide"))    return "📽️";
  if (t.includes("copilot"))       return "🤝";
  if (t.includes("chat"))          return "💬";
  if (t.includes("agent"))         return "🤖";
  if (t.includes("workflow") || t.includes("automat")) return "⚙️";
  if (t.includes("app"))           return "📱";
  if (t.includes("skill") || t.includes("learn"))      return "🎯";
  const code = (title?.charCodeAt(0) ?? 65) % 6;
  return ["✨", "🔥", "⚡", "🌟", "🚀", "💡"][code];
}

function applyVideoBlurb(description: string | null | undefined): string {
  if (!description?.trim()) return "";
  const cleaned = description.replace(/\n*\[seed:ai-features-guide-v1]\s*$/i, "").trim();
  const line = cleaned.split(/\n+/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  return line.length > 96 ? `${line.slice(0, 94)}…` : line;
}

const GROUP_COLORS: Record<string, string> = {
  Features:  "#A855F7",
  Apps:      "#EC4899",
  Workflows: "#F68A29",
  Skills:    "#3699FC",
};

function featureAccent(group: string | null | undefined): string {
  const g = (group || "").trim();
  return GROUP_COLORS[g] || "#623CEA";
}

function tagVariant(tag: string | null | undefined): { bg: string; color: string } {
  const t = (tag || "").toUpperCase();
  if (t.includes("EDIT"))    return { bg: "rgba(98,60,234,0.12)",  color: "#623CEA" };
  if (t.includes("PERSONAL"))return { bg: "rgba(236,72,153,0.12)", color: "#BE185D" };
  if (t.includes("KNOW"))    return { bg: "rgba(246,138,41,0.14)", color: "#92400E" };
  if (t.includes("WORK"))    return { bg: "rgba(54,153,252,0.13)", color: "#1E40AF" };
  return { bg: "rgba(34,29,35,0.08)", color: "#6B6B6B" };
}
