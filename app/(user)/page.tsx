import { createClient } from "@/lib/supabase/server";
import type {
  ApplyVideo,
  HomeBriefHero,
  HomeWeeklyWatchVideo,
  Module,
  NewsItem,
  ProductOfDay,
  WatchVideo,
  World,
} from "@/lib/types";
import HomeContent from "@/components/user/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: newsBrief },
    { data: briefHeroRow },
    { data: productOfDay },
    { data: weeklyPickRows },
    { data: worlds },
    { data: modules },
    { data: applyMidVideos },
  ] = await Promise.all([
    supabase.from("news_items").select("*").eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }),
    supabase
      .from("home_brief_hero")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("product_of_day").select("*").eq("is_active", true).maybeSingle(),
    supabase.from("home_weekly_watch_videos").select("*").order("slot", { ascending: true }).limit(4),
    supabase.from("worlds").select("*").eq("is_published", true).order("order_index").limit(12),
    supabase.from("modules").select("*").eq("is_published", true).order("order_index"),
    supabase.from("apply_videos").select("*").eq("is_published", true).order("order_index").limit(3),
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

  return (
    <HomeContent
      briefNews={(newsBrief || []) as NewsItem[]}
      briefHero={(briefHeroRow as HomeBriefHero | null) ?? null}
      productOfWeek={(productOfDay as ProductOfDay | null) ?? null}
      libraryVideos={libraryVideos}
      worlds={(worlds || []) as World[]}
      modules={(modules || []) as Module[]}
      applyMidVideos={(applyMidVideos || []) as ApplyVideo[]}
    />
  );
}
