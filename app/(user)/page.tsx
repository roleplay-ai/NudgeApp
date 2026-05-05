import { createClient } from "@/lib/supabase/server";
import type { NewsItem, ProductOfDay, Resource, Tool, TrendingTopic, WatchVideo } from "@/lib/types";
import HomeContent from "@/components/user/HomeContent";

export const dynamic = "force-dynamic";

function pickResearchResource(resources: Resource[]): Resource | null {
  for (const r of resources) {
    const t = `${r.resource_type || ""} ${r.category || ""}`.toLowerCase();
    if (/(research|paper|report|study)/i.test(t)) return r;
  }
  return null;
}

function sortTopResources(pool: Resource[]): Resource[] {
  return [...pool]
    .sort((a, b) => {
      const fa = a.is_featured ? 1 : 0;
      const fb = b.is_featured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    })
    .slice(0, 3);
}

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: newsBrief },
    { data: trending },
    { data: productOfDay },
    { data: libraryVideos },
    { data: resourcePool },
    { data: researchTool },
  ] = await Promise.all([
    supabase.from("news_items").select("*").eq("is_published", true).order("published_at", { ascending: false }).limit(3),
    supabase.from("trending_topics").select("*").eq("is_active", true).maybeSingle(),
    supabase.from("product_of_day").select("*").eq("is_active", true).maybeSingle(),
    supabase.from("watch_videos").select("*").eq("is_published", true).order("order_index", { ascending: true }).limit(4),
    supabase.from("resources").select("*").eq("is_published", true).order("order_index", { ascending: true }).limit(40),
    supabase.from("tools").select("*").eq("is_published", true).ilike("category", "%Research%").order("order_index", { ascending: true }).limit(1).maybeSingle(),
  ]);

  const resources = (resourcePool || []) as Resource[];
  const researchResource = pickResearchResource(resources);
  const topResources = sortTopResources(resources);

  return (
    <HomeContent
      briefNews={(newsBrief || []) as NewsItem[]}
      productOfWeek={(productOfDay as ProductOfDay | null) ?? null}
      featureTrending={(trending as TrendingTopic | null) ?? null}
      researchResource={researchResource}
      researchTool={(researchTool as Tool | null) ?? null}
      libraryVideos={(libraryVideos || []) as WatchVideo[]}
      topResources={topResources}
    />
  );
}
