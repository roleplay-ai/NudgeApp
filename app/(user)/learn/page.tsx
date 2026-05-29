import { createClient } from "@/lib/supabase/server";
import type { World, Module, GlossaryTerm, Resource, ApplyVideo } from "@/lib/types";
import { toPlainJson } from "@/lib/toPlain";
import LearnTabs from "@/components/user/LearnTabs";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const supabase = await createClient();
  const [
    { data: worlds },
    { data: modules },
    { data: glossary },
    { data: resources },
    { data: videos },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("worlds").select("*").eq("is_published", true).order("order_index"),
    supabase.from("modules").select("*").eq("is_published", true).order("order_index"),
    supabase.rpc("search_glossary", { p_query: "" }),
    supabase.from("resources").select("*").eq("is_published", true).order("order_index"),
    supabase.from("apply_videos").select("*").eq("is_published", true).order("order_index"),
    supabase.auth.getUser(),
  ]);

  let completedModuleIds: string[] = [];
  let completedVideoIds: string[] = [];
  if (user) {
    const [{ data: moduleTxns }, { data: videoTxns }] = await Promise.all([
      supabase.from("point_transactions").select("source_id").eq("source_type", "module"),
      supabase.from("point_transactions").select("source_id").eq("source_type", "apply_video"),
    ]);
    completedModuleIds = (moduleTxns || []).map((t) => t.source_id as string);
    completedVideoIds = (videoTxns || []).map((t) => t.source_id as string);
  }

  return (
    <div>
      {/* Page header with brand color accents */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black tracking-[3px] text-norange bg-norange/10 px-2.5 py-1 rounded-full border border-norange/20">
          LEARN
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">
        Build your{" "}
        <span className="relative inline-block">
          <span className="relative z-10">AI fluency</span>
          <span className="absolute -bottom-0.5 left-0 right-0 h-2.5 bg-amber/30 rounded-sm -z-0" />
        </span>
      </h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Structured lessons, a searchable glossary, hand-picked resources, and AI feature videos.
      </p>
      <LearnTabs
        worlds={(worlds || []) as World[]}
        modules={(modules || []) as Module[]}
        glossary={(glossary || []) as GlossaryTerm[]}
        resources={(resources || []) as Resource[]}
        videos={toPlainJson((videos || []) as ApplyVideo[])}
        initialTab={searchParams?.tab}
        isLoggedIn={!!user}
        initialCompletedModuleIds={completedModuleIds}
        initialCompletedVideoIds={completedVideoIds}
      />
    </div>
  );
}
