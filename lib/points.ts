/**
 * Client-side helper for awarding XP via the `award_points` Postgres function.
 *
 * The function is SECURITY DEFINER and lives entirely in the DB — this module
 * is just a thin typed wrapper so call-sites don't have to spell out the RPC.
 *
 * Usage:
 *   import { awardPoints } from "@/lib/points";
 *   await awardPoints(supabase, { userId, sourceType: "video", sourceId: video.id, points: 10 });
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type AwardPointsParams = {
  userId: string;
  sourceType: "module" | "video" | "news" | "apply_video" | "quiz_question" | string;
  sourceId: string;
  points: number;
  /** Optional key to make the grant idempotent across sessions (e.g. "streak:2026-W19"). */
  idempotencyKey?: string;
};

/**
 * Calls the `public.award_points` Postgres RPC.
 * Returns `true` if the call succeeded, `false` on error (logs to console in dev).
 */
export async function awardPoints(
  supabase: SupabaseClient,
  params: AwardPointsParams,
): Promise<boolean> {
  const { userId, sourceType, sourceId, points, idempotencyKey } = params;

  const { error } = await supabase.rpc("award_points", {
    p_user: userId,
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_points: points,
    p_idempotency_key: idempotencyKey ?? null,
  });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[awardPoints] RPC error:", error.message);
    }
    return false;
  }

  return true;
}

/**
 * Resolves the effective points for a content item:
 * uses the per-item `points_award` override when set, otherwise falls back
 * to the `defaultPoints` from `point_rules` for that content type.
 */
export function resolvePoints(
  pointsAward: number | null | undefined,
  defaultPoints: number,
): number {
  return pointsAward != null && pointsAward > 0 ? pointsAward : defaultPoints;
}
