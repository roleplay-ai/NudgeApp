import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type {
  ApplyVideo,
  HomeBriefHero,
  HomeWeeklyWatchVideo,
  Module,
  NewsItem,
  ProductOfDay,
  Tool,
  WatchVideo,
  World,
} from "@/lib/types";
import HomeContent from "@/components/user/HomeContent";
import { getActiveCoupon } from "@/app/actions/getCoupon";
import { resolveDisplayName } from "@/lib/displayName";

export const metadata: Metadata = {
  verification: {
    google: "pjfugdNsTndNEq6kBSvjVY12UmwRwP5cLjz4fMbGP8o",
  },
};

export const dynamic = "force-dynamic";

const MAX_PRODUCTS_OF_WEEK = 7;

/** Map a tools row into the same shape the Products carousel expects (synthetic id `tool:…`). */
function toolToWeeklyProduct(t: Tool): ProductOfDay {
  const tag =
    (t.company && t.company.trim()) ||
    (t.best_for && t.best_for.trim()) ||
    t.category ||
    "";
  const description =
    (t.description && t.description.trim()) || (t.best_for && t.best_for.trim()) || t.name;
  return {
    id: `tool:${t.id}`,
    name: t.name,
    tagline: tag,
    description,
    url: (t.url && t.url.trim()) || "/tools",
    image_url: t.logo_url,
    tool_id: t.id,
    is_active: false,
    active_date: new Date().toISOString(),
  };
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let points = 0;
  let streak = 0;
  if (user) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("display_name, xp, streak")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr) {
      console.error("[HomePage] profile fetch failed:", profileErr.message);
    }
    const meta = user.user_metadata ?? {};
    displayName = resolveDisplayName({
      profileDisplayName: profile?.display_name,
      metaFullName: meta.full_name,
      metaName: meta.name,
    });
    points = Number(profile?.xp ?? 0);
    streak = Number(profile?.streak ?? 0);
  }

  // Coupon — only meaningful for logged-in users (RLS returns null for guests)
  const coupon = user ? await getActiveCoupon() : null;
  if (process.env.NODE_ENV !== "production") {
    console.log("[Home] coupon fetch result:", coupon ? `code=${coupon.code}` : "null (no active coupon or table empty)");
  }

  const [
    { data: newsBrief },
    { data: briefHeroRow },
    { data: productsData },
    { data: weeklyPickRows },
    { data: worlds },
    { data: modules },
    { data: applyMidVideos },
    { count: applyVideosPublishedCount },
  ] = await Promise.all([
    supabase.from("news_items").select("*").eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }),
    supabase
      .from("home_brief_hero")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("product_of_day")
      .select("*")
      .eq("is_active", true)
      .order("active_date", { ascending: false })
      .limit(MAX_PRODUCTS_OF_WEEK),
    supabase.from("home_weekly_watch_videos").select("*").order("slot", { ascending: true }).limit(4),
    supabase.from("worlds").select("*").eq("is_published", true).order("order_index").limit(12),
    supabase.from("modules").select("*").eq("is_published", true).order("order_index"),
    supabase.from("apply_videos").select("*").eq("is_published", true).order("order_index").limit(12),
    supabase.from("apply_videos").select("id", { count: "exact", head: true }).eq("is_published", true),
  ]);

  const picks = (weeklyPickRows || []) as HomeWeeklyWatchVideo[];
  const pickedIds = picks.map((p) => p.watch_video_id).filter(Boolean);
  let libraryVideos: WatchVideo[] = [];

  if (pickedIds.length === 4) {
    const { data } = await supabase.from("watch_videos").select("*").in("id", pickedIds);
    const byId = new Map(((data || []) as WatchVideo[]).map((v) => [v.id, v]));
    libraryVideos = picks.map((p) => byId.get(p.watch_video_id)).filter(Boolean) as WatchVideo[];
  }

  if (libraryVideos.length !== 4) {
    const { data } = await supabase
      .from("watch_videos")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })
      .limit(4);
    libraryVideos = (data || []) as WatchVideo[];
  }

  // Explicit weekly picks (is_active) first; pad up to 7 with featured tools, then other published tools.
  let products = (productsData || []) as ProductOfDay[];
  if (products.length < MAX_PRODUCTS_OF_WEEK) {
    const usedToolIds = new Set(products.map((p) => p.tool_id).filter(Boolean) as string[]);
    let remaining = MAX_PRODUCTS_OF_WEEK - products.length;

    const { data: featuredTools } = await supabase
      .from("tools")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("order_index", { ascending: true })
      .limit(32);

    for (const t of (featuredTools || []) as Tool[]) {
      if (remaining <= 0) break;
      if (usedToolIds.has(t.id)) continue;
      usedToolIds.add(t.id);
      products.push(toolToWeeklyProduct(t));
      remaining--;
    }

    if (remaining > 0) {
      const { data: publishedTools } = await supabase
        .from("tools")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true })
        .limit(48);

      for (const t of (publishedTools || []) as Tool[]) {
        if (remaining <= 0) break;
        if (usedToolIds.has(t.id)) continue;
        usedToolIds.add(t.id);
        products.push(toolToWeeklyProduct(t));
        remaining--;
      }
    }
  }

  return (
    <HomeContent
      briefNews={(newsBrief || []) as NewsItem[]}
      briefHero={(briefHeroRow as HomeBriefHero | null) ?? null}
      products={products}
      libraryVideos={libraryVideos}
      worlds={(worlds || []) as World[]}
      modules={(modules || []) as Module[]}
      applyMidVideos={(applyMidVideos || []) as ApplyVideo[]}
      applyVideosTotal={applyVideosPublishedCount ?? (applyMidVideos || []).length}
      displayName={displayName}
      isLoggedIn={!!user}
      points={points}
      streak={streak}
      coupon={coupon}
    />
  );
}
