import { createClient } from "@/lib/supabase/server";
import type { Tool } from "@/lib/types";
import ToolsList from "@/components/user/ToolsList";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const supabase = await createClient();
  // tools_full view aggregates pros/cons as JSONB arrays and filters is_published
  const { data } = await supabase.from("tools_full").select("*").order("order_index");
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">EXPLORE</div>
      <h1 className="text-2xl font-extrabold text-shadow mb-1">Best AI tools</h1>
      <p className="text-sm text-muted mb-5 max-w-2xl">
        Vetted picks — with honest pros, cons, and who they&apos;re best for.
      </p>
      <ToolsList tools={(data || []) as Tool[]} />
    </div>
  );
}
