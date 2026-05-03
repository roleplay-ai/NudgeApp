import { createClient } from "@/lib/supabase/server";
import type { NewsItem, WatchVideo } from "@/lib/types";
import TodayTabs from "@/components/user/TodayTabs";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const supabase = await createClient();
  const [{ data: news }, { data: videos }] = await Promise.all([
    supabase.from("news_items").select("*").eq("is_published", true).order("published_at", { ascending: false }),
    supabase.from("watch_videos").select("*").eq("is_published", true).order("order_index"),
  ]);
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">STAY UPDATED</div>
      <h1 className="text-2xl font-extrabold text-shadow mb-1">What's new in AI</h1>
      <p className="text-sm text-muted mb-5">Videos, news and launches — all in one feed.</p>
      <TodayTabs news={(news || []) as NewsItem[]} videos={(videos || []) as WatchVideo[]} />
    </div>
  );
}
