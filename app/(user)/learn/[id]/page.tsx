import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Module, ModuleScreen } from "@/lib/types";
import ModulePlayer from "@/components/user/ModulePlayer";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: mod }, { data: screens }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", id).single(),
    supabase
      .from("module_screens")
      .select("*, screen_options(*), screen_tokens(*)")
      .eq("module_id", id)
      .order("order_index"),
  ]);
  if (!mod) return notFound();

  if (!screens || screens.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-shadow mb-2">{(mod as Module).title}</h2>
        <p className="text-muted mb-6">This module doesn't have any cards yet.</p>
        <Link href="/learn" className="text-dodger underline">Back to Learn</Link>
      </div>
    );
  }

  // Sort nested screen_options and screen_tokens by order_index
  const sortedScreens = (screens as ModuleScreen[]).map((s) => ({
    ...s,
    screen_options: s.screen_options?.sort((a, b) => a.order_index - b.order_index) ?? [],
    screen_tokens: s.screen_tokens?.sort((a, b) => a.order_index - b.order_index) ?? [],
  }));

  return <ModulePlayer module={mod as Module} screens={sortedScreens} />;
}
