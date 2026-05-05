import { createClient } from "@/lib/supabase/server";
import type {
  ApplyVideo,
  HomeBriefHero,
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
    { data: libraryVideos },
    { data: worlds },
    { data: modules },
    { data: applyMidVideos },
  ] = await Promise.all([
    supabase.from("news_items").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(3),
    supabase
      .from("home_brief_hero")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("product_of_day").select("*").eq("is_active", true).maybeSingle(),
    supabase.from("watch_videos").select("*").eq("is_published", true).order("order_index", { ascending: true }).limit(4),
    supabase.from("worlds").select("*").eq("is_published", true).order("order_index").limit(12),
    supabase.from("modules").select("*").eq("is_published", true).order("order_index"),
    supabase.from("apply_videos").select("*").eq("is_published", true).order("order_index").limit(3),
  ]);

  return (
    <HomeContent
      briefNews={(newsBrief || []) as NewsItem[]}
      briefHero={(briefHeroRow as HomeBriefHero | null) ?? null}
      productOfWeek={(productOfDay as ProductOfDay | null) ?? null}
      libraryVideos={(libraryVideos || []) as WatchVideo[]}
      worlds={(worlds || []) as World[]}
      modules={(modules || []) as Module[]}
      applyMidVideos={(applyMidVideos || []) as ApplyVideo[]}
    />
  );
}
