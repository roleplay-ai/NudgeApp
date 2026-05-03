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
      <h1 className="text-2xl font-extrabold text-shadow mb-5">What's new</h1>
      <TodayTabs news={(news || []) as NewsItem[]} videos={(videos || []) as WatchVideo[]} />
    </div>
  );
}
