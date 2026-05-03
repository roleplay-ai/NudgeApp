import { createClient } from "@/lib/supabase/server";
import type { ApplyTask } from "@/lib/types";
import ApplyGrid from "@/components/user/ApplyGrid";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("apply_tasks")
    .select("*")
    .eq("is_published", true)
    .order("order_index");
  const tasks = (data || []) as ApplyTask[];
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">APPLY</div>
      <h1 className="text-2xl font-extrabold text-shadow mb-1">What can AI do?</h1>
      <p className="text-sm text-muted mb-5">Tap any card to learn how it works.</p>
      <ApplyGrid tasks={tasks} />
    </div>
  );
}
