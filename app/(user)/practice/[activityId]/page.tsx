import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { PracticeActivity, PracticeSession, PracticeScore } from "@/lib/types";
import PracticeChat from "@/components/user/PracticeChat";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PracticeActivityPage({ params }: { params: { activityId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: activity } = await supabase
    .from("practice_activities")
    .select("*")
    .eq("id", params.activityId)
    .eq("is_published", true)
    .single();

  if (!activity) notFound();

  if (activity.is_locked && !user) redirect("/login");

  let latestSubmitted: PracticeSession | null = null;
  let submittedScores: (PracticeScore & { name: string; max_score: number })[] = [];

  if (user) {
    const { data: submittedSessions } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("activity_id", params.activityId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(1);

    latestSubmitted = (submittedSessions?.[0] as PracticeSession) || null;

    if (latestSubmitted) {
      const { data: scores } = await supabase
        .from("practice_scores")
        .select("*")
        .eq("session_id", latestSubmitted.id);

      submittedScores = ((scores || []) as any[]).map((s) => ({
        ...s,
        name: s.rubric_name ?? "",
        max_score: s.max_score ?? 0,
      }));
    }
  }

  return (
    <div>
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-shadow font-semibold mb-5 transition">
        <ArrowLeft size={14} /> Back to activities
      </Link>

      <PracticeChat
        activity={activity as PracticeActivity}
        initialSession={null}
        initialMessages={[]}
        latestSubmitted={latestSubmitted}
        submittedScores={submittedScores}
        userId={user?.id ?? null}
        isLoggedIn={!!user}
      />
    </div>
  );
}
