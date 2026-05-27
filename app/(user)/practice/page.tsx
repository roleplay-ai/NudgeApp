import Link from "next/link";
import { PenLine, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Quiz, PracticeActivity, PracticeSession } from "@/lib/types";
import QuizList from "@/components/user/QuizList";
import PracticeActivityList from "@/components/user/PracticeActivityList";
import PracticeBottomCards from "@/components/user/PracticeBottomCards";

export const dynamic = "force-dynamic";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "prompts" ? "prompts" : "quiz";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let quizzes: Quiz[] = [];
  let completionMap: Record<string, number> = {};
  let activities: PracticeActivity[] = [];
  let sessionMap: Record<string, PracticeSession> = {};

  if (tab === "quiz") {
    const { data: q } = await supabase
      .from("quizzes")
      .select("*")
      .eq("is_published", true)
      .order("order_index");
    quizzes = (q || []) as Quiz[];

    if (user) {
      const { data: completions } = await supabase
        .from("quiz_completions")
        .select("quiz_id, points_earned");
      if (completions) {
        for (const c of completions) completionMap[c.quiz_id] = c.points_earned;
      }
    }
  } else {
    const { data: a } = await supabase
      .from("practice_activities")
      .select("*, practice_rubrics(id, name, max_score)")
      .eq("is_published", true)
      .order("order_index");
    activities = (a as PracticeActivity[]) ?? [];

    if (user) {
      const { data: sessions } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", user.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false });
      for (const s of sessions || []) {
        if (!sessionMap[(s as PracticeSession).activity_id]) {
          sessionMap[(s as PracticeSession).activity_id] = s as PracticeSession;
        }
      }
    }
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div>
      {/* Header */}
      <div className="mb-2">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-homeClay">
          PRACTICE
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-homeInk mb-1 tracking-tight">
        {tab === "quiz" ? (
          <>
            Test your{" "}
            <span className="relative inline-block">
              <span className="relative z-10">knowledge</span>
              <span className="absolute -bottom-0.5 left-0 right-0 h-2.5 bg-amber/30 rounded-sm -z-0" />
            </span>
          </>
        ) : (
          <>
            Hi <span className="text-homeClay">{displayName}</span>, ready to practice?
          </>
        )}
      </h1>
      <p className="text-sm text-muted mb-5">
        {tab === "quiz"
          ? "Quick quizzes to check what you know. Answer each question and earn points."
          : "Pick an activity, write your prompts, and submit for assessment."}
      </p>

      {/* Mode switcher */}
      <div className="flex p-1 rounded-2xl border border-homeInk/10 bg-homeInk/[0.04] mb-6 shadow-sm">
        {([
          { id: "quiz", label: "Quiz", icon: Trophy },
          { id: "prompts", label: "Prompts", icon: PenLine },
        ] as const).map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/practice?tab=${id}`}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition no-underline ${
              tab === id
                ? "bg-homeClay text-white shadow-md"
                : "text-homeNavMuted hover:text-homeInk"
            }`}
          >
            <Icon size={16} strokeWidth={2.2} />
            {label}
          </Link>
        ))}
      </div>

      {/* Quiz tab */}
      {tab === "quiz" && (
        <QuizList
          quizzes={quizzes}
          isLoggedIn={!!user}
          completions={completionMap}
        />
      )}

      {/* Prompts tab */}
      {tab === "prompts" && (
        <>
          <div className="bg-homeInk rounded-2xl border border-homeInk/10 shadow-md px-5 pt-6 pb-6 md:px-8 md:pt-7 md:pb-7 mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">
                HOW IT WORKS
              </span>
              <span className="text-[12px] text-homeWarmGray">
                3 simple steps · ~10–25 min each
              </span>
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

          <PracticeActivityList
            activities={activities}
            sessionMap={sessionMap}
            isLoggedIn={!!user}
          />
        </>
      )}

      <PracticeBottomCards isLoggedIn={!!user} />
    </div>
  );
}
