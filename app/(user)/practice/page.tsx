import { createClient } from "@/lib/supabase/server";
import type { PracticeActivity, PracticeSession } from "@/lib/types";
import PracticeActivityList from "@/components/user/PracticeActivityList";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const supabase = await createClient();
  const [{ data: activities }, { data: { user } }] = await Promise.all([
    supabase
      .from("practice_activities")
      .select("*, practice_rubrics(id, name, max_score)")
      .eq("is_published", true)
      .order("order_index"),
    supabase.auth.getUser(),
  ]);

  // Load user's past sessions so we know which activities are "done"
  let sessionMap: Record<string, PracticeSession> = {};
  if (user) {
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false });

    for (const s of sessions || []) {
      // Keep the latest submission per activity
      if (!sessionMap[(s as PracticeSession).activity_id]) {
        sessionMap[(s as PracticeSession).activity_id] = s as PracticeSession;
      }
    }
  }

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "there";

  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-homeClay">
          PRACTICE
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-homeInk mb-1 tracking-tight">
        Hi <span className="text-homeClay">{displayName}</span>, ready to practice?
      </h1>
      <p className="text-sm text-homeBodyMuted mb-6">
        Pick an activity, write your prompts, and submit for assessment.
      </p>

      {/* How it works card */}
      <div className="bg-homeInk rounded-2xl border border-homeInk/10 shadow-md px-5 pt-6 pb-6 md:px-8 md:pt-7 md:pb-7 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">HOW IT WORKS</span>
          <span className="text-[12px] text-homeWarmGray">3 simple steps · ~10–25 min each</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight mb-4">
          Real prompts. Honest feedback. Faster fluency.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: "1", title: "Pick an activity", body: "Browse real-world AI tasks across categories." },
            { n: "2", title: "Write your prompts", body: "Chat with the AI Coach to solve the brief." },
            { n: "3", title: "Submit & assess", body: "Get a score, feedback, and a path to improve." },
          ].map((step) => (
            <div key={step.n} className="flex gap-3">
              <div className="w-7 h-7 rounded-md bg-homeClay flex items-center justify-center text-white font-bold text-sm shrink-0">
                {step.n}
              </div>
              <div>
                <div className="font-bold text-sm text-white">{step.title}</div>
                <div className="text-xs text-homeWarmGray mt-0.5">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activities */}
      <PracticeActivityList
        activities={(activities as PracticeActivity[]) || []}
        sessionMap={sessionMap}
        isLoggedIn={!!user}
      />
    </div>
  );
}
