import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Quiz, QuizQuestion } from "@/lib/types";
import QuizPlayer from "@/components/user/QuizPlayer";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: { quizId: string } }) {
  const supabase = await createClient();

  const [{ data: quiz }, { data: questions }, { data: { user } }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("*")
      .eq("id", params.quizId)
      .eq("is_published", true)
      .single(),
    supabase
      .from("quiz_questions")
      .select("*, quiz_options(*)")
      .eq("quiz_id", params.quizId)
      .order("order_index"),
    supabase.auth.getUser(),
  ]);

  if (!quiz) notFound();

  // Sort options within each question
  const questionsWithSortedOptions = (questions || []).map((q: QuizQuestion) => ({
    ...q,
    quiz_options: (q.quiz_options || []).sort((a, b) => a.order_index - b.order_index),
  }));

  return (
    <QuizPlayer
      quiz={quiz as Quiz}
      questions={questionsWithSortedOptions as QuizQuestion[]}
      isLoggedIn={!!user}
    />
  );
}
