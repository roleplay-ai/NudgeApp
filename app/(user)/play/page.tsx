import { createClient } from "@/lib/supabase/server";
import type { Quiz } from "@/lib/types";
import QuizList from "@/components/user/QuizList";

export const dynamic = "force-dynamic";

export default async function PlayPage() {
  const supabase = await createClient();
  const [{ data: quizzes }, { data: { user } }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("*")
      .eq("is_published", true)
      .order("order_index"),
    supabase.auth.getUser(),
  ]);

  let completionMap: Record<string, number> = {};
  if (user) {
    const { data: completions } = await supabase
      .from("quiz_completions")
      .select("quiz_id, points_earned");
    if (completions) {
      for (const c of completions) {
        completionMap[c.quiz_id] = c.points_earned;
      }
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black tracking-[3px] text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200">
          PLAY
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">
        Test your{" "}
        <span className="relative inline-block">
          <span className="relative z-10">knowledge</span>
          <span className="absolute -bottom-0.5 left-0 right-0 h-2.5 bg-amber/30 rounded-sm -z-0" />
        </span>
      </h1>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Quick quizzes to check what you know. Answer each question and earn points.
      </p>
      <QuizList
        quizzes={(quizzes || []) as Quiz[]}
        isLoggedIn={!!user}
        completions={completionMap}
      />
    </div>
  );
}
