"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePoints } from "@/lib/points";

/**
 * Server action wrapper around the `award_points` Postgres RPC.
 *
 * Running the award on the server gives us three advantages over the
 * client-side `supabase.rpc()` approach:
 *  1. The current user's id comes from the server session — no need to pass
 *     it through the component tree or fetch it client-side.
 *  2. Errors are logged to the server console and returned to the caller so
 *     they are actually visible during development.
 *  3. `revalidatePath` for the `(user)` surfaces (layout + `/`, `/learn`,
 *     `/apply`, `/profile`) busts Next's RSC cache so `router.refresh()`
 *     after an Apply "Got it" or module finish shows updated `profiles.xp` /
 *     `streak`.
 */
export async function awardPointsAction({
  sourceType,
  sourceId,
  pointsAward,
  defaultPoints,
  idempotencyKey,
}: {
  sourceType:
    | "module"
    | "video"
    | "news"
    | "apply_video"
    | "quiz_question"
    | "resource"
    | "tool"
    | string;
  sourceId: string;
  /** Per-item `points_award` column value (may be null). */
  pointsAward?: number | null;
  /** Fallback used when `pointsAward` is null/0 — should match `point_rules` seed. */
  defaultPoints: number;
  idempotencyKey?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const points = resolvePoints(pointsAward, defaultPoints);

  const { error } = await supabase.rpc("award_points", {
    p_user: user.id,
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_points: points,
    p_idempotency_key: idempotencyKey ?? null,
  });

  if (error) {
    console.error("[awardPointsAction] RPC error:", {
      message: error.message,
      code: (error as { code?: string }).code,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint,
      sourceType,
      sourceId,
      points,
      userId: user.id,
    });
    return { success: false, error: error.message };
  }

  // Bust layout + primary user routes so xp/streak propagate whether the viewer
  // completed a Learn module, tapped Apply → Got it, or will land on Home / Profile.
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/learn");
  revalidatePath("/apply");
  revalidatePath("/profile");

  return { success: true };
}
