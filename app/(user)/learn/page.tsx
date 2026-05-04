import { createClient } from "@/lib/supabase/server";
import type { World, Module, GlossaryTerm, Resource } from "@/lib/types";
import LearnTabs from "@/components/user/LearnTabs";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const supabase = await createClient();
  const [{ data: worlds }, { data: modules }, { data: glossary }, { data: resources }] = await Promise.all([
    supabase.from("worlds").select("*").eq("is_published", true).order("order_index"),
    supabase.from("modules").select("*").eq("is_published", true).order("order_index"),
    supabase.rpc("search_glossary", { p_query: "" }),
    supabase.from("resources").select("*").eq("is_published", true).order("order_index"),
  ]);

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">LEARN</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">Build your AI fluency</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Structured lessons, a searchable glossary, and hand-picked external resources.
      </p>
      <LearnTabs
        worlds={(worlds || []) as World[]}
        modules={(modules || []) as Module[]}
        glossary={(glossary || []) as GlossaryTerm[]}
        resources={(resources || []) as Resource[]}
      />
    </div>
  );
}
