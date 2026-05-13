"use client";

import { useEffect, useRef } from "react";
import { awardPointsAction } from "@/app/actions/awardPointsAction";

const PENDING_KEY = "nudgeable_pending_quiz_points";

interface PendingEntry {
  quizId: string;
  quizTitle: string;
  points: number;
  ts: number;
}

/**
 * Mounted in the user layout only when isLoggedIn=true.
 * On first render it drains any pending quiz points the user earned as a guest,
 * awards them via the server action, then clears localStorage.
 */
export default function PendingPointsAwarder() {
  const awarded = useRef(false);

  useEffect(() => {
    if (awarded.current) return;
    awarded.current = true;

    let entries: PendingEntry[] = [];
    try {
      entries = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    } catch {
      return;
    }
    if (!entries.length) return;

    // Clear immediately so a page refresh doesn't double-award
    localStorage.removeItem(PENDING_KEY);

    // Fire-and-forget — idempotency key prevents double awards if the user
    // refreshes before the RPC completes.
    entries.forEach((entry) => {
      awardPointsAction({
        sourceType: "quiz",
        sourceId: `guest-transfer:${entry.quizId}`,
        pointsAward: entry.points,
        defaultPoints: entry.points,
        idempotencyKey: `guest-transfer:${entry.quizId}:${entry.ts}`,
      }).catch(() => {
        // Best-effort; silently ignore RPC failures for guest transfers
      });
    });
  }, []);

  return null;
}
