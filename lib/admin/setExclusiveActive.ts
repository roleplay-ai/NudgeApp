import type { SupabaseClient } from "@supabase/supabase-js";

/** Ensure exactly one row in `table` has `is_active === true` (the given id). */
export async function setExclusiveActiveRow(
  supabase: SupabaseClient,
  table: "video_of_day" | "product_of_day",
  activeId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error: selErr } = await supabase.from(table).select("id");
  if (selErr) return { ok: false, message: selErr.message };

  for (const row of data ?? []) {
    const { error } = await supabase
      .from(table)
      .update({ is_active: row.id === activeId })
      .eq("id", row.id);
    if (error) return { ok: false, message: error.message };
  }

  return { ok: true };
}
