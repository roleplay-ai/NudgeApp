"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { awardPointsAction } from "@/app/actions/awardPointsAction";

type SourceType =
  | "video"
  | "news"
  | "resource"
  | "tool"
  | "apply_video"
  | "module"
  | "quiz_question";

/**
 * Returns a click handler that fires the {@link awardPointsAction} for a
 * piece of clickable content (watch video card, article row, resource tile,
 * news brief link, …) without blocking the user's navigation.
 *
 * Behaviour:
 *  - The award RPC is awarded in the background; we never `await` it before
 *    letting the `<a>`'s default behaviour open the link.
 *  - The DB's idempotency key (`user_id + source_type + source_id + key`) means
 *    a user only earns XP the first time they engage with a given item — repeat
 *    clicks are silently deduplicated server-side.
 *  - A per-instance ref guards against accidental double-fires within a single
 *    render (rapid double-clicks, React StrictMode dev double-invocation).
 *  - After the award resolves we call `router.refresh()` so the sidebar /
 *    mobile-strip XP counters update without a full reload.
 */
export function useAwardOnClick(opts: {
  sourceType: SourceType;
  sourceId: string;
  pointsAward: number | null | undefined;
  defaultPoints: number;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const firedRef = useRef(false);

  return useCallback(() => {
    if (firedRef.current) return;
    if (opts.isLoggedIn === false) return;
    firedRef.current = true;

    void (async () => {
      try {
        await awardPointsAction({
          sourceType: opts.sourceType,
          sourceId: opts.sourceId,
          pointsAward: opts.pointsAward,
          defaultPoints: opts.defaultPoints,
        });
        router.refresh();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[useAwardOnClick] award_points failed:", err);
        }
      }
    })();
  }, [
    opts.sourceType,
    opts.sourceId,
    opts.pointsAward,
    opts.defaultPoints,
    opts.isLoggedIn,
    router,
  ]);
}

/** Default points constants kept in sync with the `point_rules` seed. */
export const DEFAULT_POINTS = {
  video: 10,
  news: 5,
  resource: 5,
  tool: 5,
  apply_video: 15,
  module: 50,
  quiz_question: 10,
} as const;
