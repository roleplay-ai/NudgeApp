"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Called once when the user finishes a quiz.
 * Delegates to complete_quiz() which:
 *   - First attempt  → awards pointsEarned directly to profiles.xp
 *   - Re-attempt     → applies the delta (new − previous) so XP always
 *                      reflects the latest score, not a cumulative sum.
 *
 * Returns the XP delta that was actually applied so the UI can show
 * an improvement/regression message.
 */
export async function completeQuizAction({
  quizId,
  pointsEarned,
}: {
  quizId: string;
  pointsEarned: number;
}): Promise<{ success: boolean; delta?: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("complete_quiz", {
    p_user:   user.id,
    p_quiz:   quizId,
    p_points: pointsEarned,
  });

  if (error) {
    console.error("[completeQuizAction] RPC error:", {
      message: error.message,
      code: (error as { code?: string }).code,
      quizId,
      pointsEarned,
      userId: user.id,
    });
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/play");
  revalidatePath("/profile");

  return { success: true, delta: data as number };
}
