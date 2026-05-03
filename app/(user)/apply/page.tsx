import { createClient } from "@/lib/supabase/server";
import type { ApplyVideo } from "@/lib/types";
import ApplyVideosFeed from "@/components/user/ApplyVideosFeed";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("apply_videos")
    .select("*")
    .eq("is_published", true)
    .order("order_index");
  const videos = (data || []) as ApplyVideo[];
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">APPLY</div>
      <h1 className="text-2xl font-extrabold text-shadow mb-1">Walkthrough videos</h1>
      <p className="text-sm text-muted mb-5">
        Short guides from your team — press play on any clip below; everything stays on this page.
      </p>
      <ApplyVideosFeed videos={videos} />
    </div>
  );
}
