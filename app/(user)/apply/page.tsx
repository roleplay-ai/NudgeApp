import { createClient } from "@/lib/supabase/server";
import type { ApplyTile, ApplyVideo } from "@/lib/types";
import { toPlainJson } from "@/lib/toPlain";
import ApplyTilesExplore from "@/components/user/ApplyTilesExplore";
import ApplyVideosFeed from "@/components/user/ApplyVideosFeed";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const supabase = await createClient();
  const [{ data: tiles }, { data: videos }] = await Promise.all([
    supabase.from("apply_tiles").select("*").order("order_index"),
    supabase.from("apply_videos").select("*").eq("is_published", true).order("order_index"),
  ]);

  const tileList = toPlainJson((tiles || []) as ApplyTile[]);
  const applyVideos = toPlainJson((videos || []) as ApplyVideo[]);

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">APPLY</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-1">What can AI do?</h1>
      {tileList.length > 0 ? (
        <ApplyTilesExplore tiles={tileList} />
      ) : (
        <div className="rounded-2xl border border-nborder bg-white p-5 mb-6 text-sm text-muted leading-relaxed space-y-2">
          <p className="font-semibold text-shadow">No feature cards yet</p>
          <p>
            This block reads from the <code className="text-xs bg-chiffon px-1 rounded">apply_tiles</code> table. If the
            table is missing, run <code className="text-xs bg-chiffon px-1 rounded">migration_010_apply_tiles_bootstrap.sql</code>{" "}
            in Supabase. If the table exists but is empty, run{" "}
            <code className="text-xs bg-chiffon px-1 rounded">seed_012_apply_tiles_ai_features_guide.sql</code>,{" "}
            <code className="text-xs bg-chiffon px-1 rounded">seed_004_apply_tiles.sql</code>, or add rows in{" "}
            <strong className="text-shadow">Admin → Apply tiles</strong>.
          </p>
          <p className="text-xs">
            Clicking a card opens a popup with details and video (when configured). Walkthrough videos below use the same
            pattern.
          </p>
        </div>
      )}

      {applyVideos.length > 0 && (
        <section className={tileList.length > 0 ? "mt-12 pt-10 border-t border-nborder" : ""}>
          <div className="text-[11px] font-bold tracking-[2px] text-norange mb-1">WALKTHROUGHS</div>
          <h2 className="text-lg font-extrabold text-shadow mb-1">Video guides</h2>
          <p className="text-sm text-muted mb-5">Click a card to open the walkthrough in a popup.</p>
          <ApplyVideosFeed videos={applyVideos} variant="dark" />
        </section>
      )}
    </div>
  );
}
