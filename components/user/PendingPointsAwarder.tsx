"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { completeQuizAction } from "@/app/actions/completeQuizAction";

const PENDING_KEY = "nudgeable_pending_quiz_points";

interface PendingEntry {
  quizId: string;
  quizTitle: string;
  points: number;
  ts: number;
}

/**
 * Mounted in the user layout only when isLoggedIn=true.
 *
 * On first mount it:
 *  1. Reads any quiz points the user earned as a guest from localStorage.
 *  2. Calls completeQuizAction for each quiz (same RPC as a normal logged-in
 *     attempt, so delta scoring works correctly on future re-attempts).
 *  3. Calls router.refresh() so the sidebar XP counter updates immediately.
 */
export default function PendingPointsAwarder() {
  const ran = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let entries: PendingEntry[] = [];
    try {
      entries = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    } catch {
      return;
    }
    if (!entries.length) return;

    // Remove from storage immediately — prevents a duplicate award if the
    // user refreshes while the async calls are in-flight.
    localStorage.removeItem(PENDING_KEY);

    async function awardAll() {
      for (const entry of entries) {
        const result = await completeQuizAction({
          quizId: entry.quizId,
          pointsEarned: entry.points,
        });
        if (!result.success) {
          console.error(
            `[PendingPointsAwarder] Failed to award ${entry.points} pts for quiz ${entry.quizId}:`,
            result.error
          );
        }
      }
      // Bust the RSC cache so profiles.xp updates in the sidebar right away.
      router.refresh();
    }

    awardAll();
    // router is stable from useRouter; omitting from deps is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
