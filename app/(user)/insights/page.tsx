import { createClient } from "@/lib/supabase/server";
import type { NewsItem, Resource, WatchVideo } from "@/lib/types";
import LibraryHub from "@/components/user/LibraryHub";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const supabase = await createClient();
  const [{ data: news }, { data: videos }, { data: resources }] = await Promise.all([
    supabase.from("news_items").select("*").eq("is_published", true).order("published_at", { ascending: false }),
    supabase.from("watch_videos").select("*").eq("is_published", true).order("order_index"),
    supabase.from("resources").select("*").eq("is_published", true).order("order_index"),
  ]);

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">INSIGHTS</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-1">Everything in one place</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        All videos, articles, news and resources, searchable and browsable.
      </p>
      <LibraryHub
        news={(news || []) as NewsItem[]}
        videos={(videos || []) as WatchVideo[]}
        resources={(resources || []) as Resource[]}
      />
    </div>
  );
}
