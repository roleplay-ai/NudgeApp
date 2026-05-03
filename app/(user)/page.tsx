import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink, Play } from "lucide-react";
import type { TrendingTopic, NewsItem, VideoOfDay, ProductOfDay, ApplyVideo } from "@/lib/types";
import { resolveVideoThumbnailUrl } from "@/lib/videoThumbnails";
import TrendingHero from "@/components/user/TrendingHero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: trending }, { data: news }, { data: videoOfDay }, { data: productOfDay }, { data: applySpotlight }] =
    await Promise.all([
      supabase.from("trending_topics").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("news_items").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(4),
      supabase.from("video_of_day").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("product_of_day").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("apply_videos").select("title, thumbnail_url").eq("is_published", true).order("order_index").limit(1).maybeSingle(),
    ]);

  const applyWalkthroughTeaser = applySpotlight as Pick<ApplyVideo, "title" | "thumbnail_url"> | null;

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <div className="text-[10px] font-bold tracking-[2px] text-norange">NUDGEABLE.AI</div>
        <h1 className="text-xl md:text-2xl font-extrabold text-shadow">
          Your daily AI boost 🚀
        </h1>
      </header>

      {trending && <TrendingHero trending={trending as TrendingTopic} />}

      {/* Top news */}
      <section>
        <SectionHeader title="🔥 Top news today" href="/today" />
        <div className="space-y-2.5">
          {(news as NewsItem[] | null)?.map((n) => (
            <a key={n.id} href={n.url || "#"} target="_blank" rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition border-l-4"
              style={{ borderLeftColor: n.tag_color || "#623CEA" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: n.tag_color || "#623CEA" }}>
                  {n.tag}
                </span>
                <span className="text-[11px] text-muted">{timeAgo(n.published_at)}</span>
                <ExternalLink size={11} className="ml-auto text-muted" />
              </div>
              <div className="text-sm font-bold text-shadow leading-tight mb-1">{n.title}</div>
              <div className="text-xs text-muted leading-relaxed">{n.body}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Video of day */}
      {videoOfDay && (() => {
        const vod = videoOfDay as VideoOfDay;
        const vodThumb = resolveVideoThumbnailUrl(vod.thumbnail_url, vod.url);
        return (
        <section>
          <SectionHeader title="🎥 Video of the day" href="/today" />
          <a href={vod.url} target="_blank" rel="noopener noreferrer"
            className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition">
            <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-fuchsia flex items-center justify-center">
              {vodThumb ? (
                <img src={vodThumb} alt={vod.title} className="w-full h-full object-cover" />
              ) : (
                <Play size={28} className="text-white" fill="white" />
              )}
              {vod.duration && (
                <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-semibold">
                  {vod.duration}
                </span>
              )}
            </div>
            <div className="flex-1 py-1">
              <div className="text-sm font-bold text-shadow leading-tight mb-1">{vod.title}</div>
              <div className="text-[11px] text-muted mb-1">{vod.creator}</div>
              <span className="text-[11px] text-dodger font-bold inline-flex items-center gap-1">
                Watch <ExternalLink size={10} />
              </span>
            </div>
          </a>
        </section>
        );
      })()}

      {/* Product of day */}
      {productOfDay && (
        <section>
          <SectionHeader title="✨ Product of the day" href="/tools" />
          <Link href="/tools" className="block bg-shadow rounded-2xl p-4 hover:opacity-95 transition">
            <div className="flex gap-3 items-center text-white">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-nblue text-2xl font-black">
                {(productOfDay as ProductOfDay).name[0]}
              </div>
              <div className="flex-1">
                <div className="text-base font-extrabold">{(productOfDay as ProductOfDay).name}</div>
                <div className="text-xs opacity-70 mb-1.5">{(productOfDay as ProductOfDay).tagline}</div>
                <span className="text-[10px] font-bold bg-amber text-shadow px-2 py-0.5 rounded-full">
                  {(productOfDay as ProductOfDay).description}
                </span>
              </div>
              <ChevronRight size={20} className="text-amber" />
            </div>
          </Link>
        </section>
      )}

      {/* Apply walkthroughs teaser */}
      {applyWalkthroughTeaser && (
        <section>
          <SectionHeader title="🎯 Apply walkthroughs" href="/apply" />
          <Link
            href="/apply"
            className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition border border-nborder"
          >
            <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-shadow flex items-center justify-center">
              {applyWalkthroughTeaser.thumbnail_url ? (
                <img src={applyWalkthroughTeaser.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Play size={28} className="text-amber" fill="currentColor" />
              )}
            </div>
            <div className="flex-1 py-1 min-w-0">
              <div className="text-sm font-bold text-shadow leading-tight mb-1 line-clamp-2">
                {applyWalkthroughTeaser.title}
              </div>
              <span className="text-[11px] text-dodger font-bold inline-flex items-center gap-1">
                Watch on Apply <ArrowRight size={10} />
              </span>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex justify-between items-center mb-2.5">
      <div className="text-sm font-bold text-shadow">{title}</div>
      {href && (
        <Link href={href} className="text-xs text-muted font-semibold hover:text-shadow flex items-center">
          See all <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}
