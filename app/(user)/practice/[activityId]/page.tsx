import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { PracticeActivity, PracticeRubric, PracticeSession, PracticeScore } from "@/lib/types";
import PracticeChat from "@/components/user/PracticeChat";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PracticeActivityPage({ params }: { params: { activityId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: activity } = await supabase
    .from("practice_activities")
    .select("*, practice_rubrics(id, name, description, max_score)")
    .eq("id", params.activityId)
    .eq("is_published", true)
    .single();

  if (!activity) notFound();

  const rubrics = (activity as any).practice_rubrics as PracticeRubric[];

  // Check if there's a submitted session (for showing results on re-entry)
  const { data: submittedSessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("activity_id", params.activityId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(1);

  const latestSubmitted = (submittedSessions?.[0] as PracticeSession) || null;
  let submittedScores: (PracticeScore & { name: string; max_score: number })[] = [];

  if (latestSubmitted) {
    const { data: scores } = await supabase
      .from("practice_scores")
      .select("*, practice_rubrics(name, max_score)")
      .eq("session_id", latestSubmitted.id);

    submittedScores = ((scores || []) as any[]).map((s) => ({
      ...s,
      name: s.practice_rubrics?.name ?? "",
      max_score: s.practice_rubrics?.max_score ?? 25,
    }));
  }

  return (
    <div>
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-shadow font-semibold mb-5 transition">
        <ArrowLeft size={14} /> Back to activities
      </Link>

      <PracticeChat
        activity={activity as PracticeActivity}
        rubrics={rubrics}
        initialSession={null}
        initialMessages={[]}
        latestSubmitted={latestSubmitted}
        submittedScores={submittedScores}
        userId={user.id}
      />
    </div>
  );
}
