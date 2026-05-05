"use server";

import { createClient } from "@/lib/supabase/server";
import type { Module, ModuleScreen } from "@/lib/types";

export async function getModuleWithScreens(id: string) {
  const supabase = await createClient();

  const [{ data: mod }, { data: screens }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", id).single(),
    supabase
      .from("module_screens")
      .select("*, screen_options(*), screen_tokens(*)")
      .eq("module_id", id)
      .order("order_index"),
  ]);

  if (!mod || !screens) return null;

  const sortedScreens = (screens as ModuleScreen[]).map((s) => ({
    ...s,
    screen_options: s.screen_options?.sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    ) ?? [],
    screen_tokens: s.screen_tokens?.sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    ) ?? [],
  }));

  return { module: mod as Module, screens: sortedScreens };
}
