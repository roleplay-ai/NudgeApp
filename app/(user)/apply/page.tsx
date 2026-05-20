import { createClient } from "@/lib/supabase/server";
import type { ApplyVideo } from "@/lib/types";
import { toPlainJson } from "@/lib/toPlain";
import ApplyVideosFeed from "@/components/user/ApplyVideosFeed";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const supabase = await createClient();
  const [{ data: videos }, { data: { user } }] = await Promise.all([
    supabase
      .from("apply_videos")
      .select("*")
      .eq("is_published", true)
      .order("order_index"),
    supabase.auth.getUser(),
  ]);

  const applyVideos = toPlainJson((videos || []) as ApplyVideo[]);

  let completedIds: string[] = [];
  if (user) {
    const { data: txns } = await supabase
      .from("point_transactions")
      .select("source_id")
      .eq("source_type", "apply_video");
    completedIds = (txns || []).map((t) => t.source_id as string);
  }

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">APPLY</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-1">What can AI do?</h1>
      <p className="text-sm text-muted mb-5 max-w-2xl">
        Browse features, apps, and workflows. Click any card to learn more.
      </p>
      <ApplyVideosFeed
        videos={applyVideos}
        variant="dark"
        isLoggedIn={!!user}
        initialCompletedIds={completedIds}
      />
    </div>
  );
}
