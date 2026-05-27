"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Lock, Trophy, Zap } from "lucide-react";
import type { Quiz } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function QuizList({
  quizzes,
  isLoggedIn,
  completions = {},
}: {
  quizzes: Quiz[];
  isLoggedIn: boolean;
  completions?: Record<string, number>;
}) {
  const completionsKey = useMemo(() => JSON.stringify(completions), [completions]);
  const [liveCompletions, setLiveCompletions] = useState(completions);

  useEffect(() => {
    if (!isLoggedIn) {
      setLiveCompletions(completions);
      return;
    }

    setLiveCompletions(completions);

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    async function pullFromDb() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("quiz_completions")
        .select("quiz_id, points_earned");
      if (cancelled || error) return;
      const next: Record<string, number> = {};
      if (data) {
        for (const row of data) {
          next[row.quiz_id] = row.points_earned;
        }
      }
      setLiveCompletions(next);
    }

    function scheduleRetries() {
      for (const ms of [0, 450, 1200]) {
        timers.push(setTimeout(() => void pullFromDb(), ms));
      }
    }

    scheduleRetries();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") scheduleRetries();
    });

    return () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [isLoggedIn, completionsKey, completions]);

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <Trophy size={36} className="text-muted opacity-40" />
        <p className="text-sm text-muted">No quizzes available yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => {
        const locked = quiz.is_locked && !isLoggedIn;
        const prevScore = liveCompletions[quiz.id];
        const isDone = prevScore !== undefined;
        return (
          <QuizCard key={quiz.id} quiz={quiz} locked={locked} isDone={isDone} prevScore={prevScore} />
        );
      })}
    </div>
  );
}

function QuizCard({
  quiz,
  locked,
  isDone,
  prevScore,
}: {
  quiz: Quiz;
  locked: boolean;
  isDone: boolean;
  prevScore?: number;
}) {
  const totalPoints = quiz.points_per_question > 0 || quiz.completion_bonus > 0;

  const card = (
    <div
      className="relative rounded-2xl border overflow-hidden transition-all duration-200 select-none"
      style={{
        background: locked ? "#F5F3F0" : "#ffffff",
        borderColor: isDone
          ? "rgba(34,197,94,0.30)"
          : locked
          ? "rgba(34,29,35,0.08)"
          : "rgba(34,29,35,0.10)",
        boxShadow: locked ? "none" : isDone ? "0 2px 12px rgba(34,197,94,0.10)" : "0 2px 12px rgba(0,0,0,0.06)",
        cursor: locked ? "default" : "pointer",
      }}
    >
      {/* Accent strip */}
      <div
        className="h-1 w-full"
        style={{
          background: locked
            ? "rgba(34,29,35,0.08)"
            : isDone
            ? "linear-gradient(90deg, #22c55e, #86efac, transparent)"
            : `linear-gradient(90deg, ${quiz.color}, ${quiz.color}55, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Emoji + status badge */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl leading-none">{quiz.emoji}</span>
          {locked && (
            <span className="flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-1 rounded-full bg-shadow/8 text-muted border border-shadow/10">
              <Lock size={9} strokeWidth={3} />
              LOGIN TO UNLOCK
            </span>
          )}
          {isDone && !locked && (
            <span className="flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
              <CheckCircle size={10} strokeWidth={3} />
              DONE
            </span>
          )}
        </div>

        <h3
          className="font-extrabold text-base leading-snug mb-1.5"
          style={{ color: locked ? "#b0a090" : "#221D23" }}
        >
          {quiz.title}
        </h3>

        {quiz.description && (
          <p
            className="text-xs leading-relaxed mb-3"
            style={{ color: locked ? "#c0b0a0" : "#7A6B5E" }}
          >
            {quiz.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto">
          {isDone && !locked ? (
            <span className="flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
              <Zap size={9} strokeWidth={3} />
              {prevScore} pts earned
            </span>
          ) : (
            totalPoints && !locked && (
              <span
                className="flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-1 rounded-full"
                style={{
                  background: `${quiz.color}14`,
                  color: quiz.color,
                  border: `1px solid ${quiz.color}30`,
                }}
              >
                <Zap size={9} strokeWidth={3} />
                {quiz.points_per_question > 0
                  ? `${quiz.points_per_question} pts/question`
                  : `${quiz.completion_bonus} pts on finish`}
              </span>
            )
          )}
          {!locked && (
            <span
              className="ml-auto text-xs font-bold"
              style={{ color: isDone ? "#22c55e" : quiz.color }}
            >
              {isDone ? "Retake →" : "Play →"}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (locked) return card;
  return <Link href={`/practice/quiz/${quiz.id}`} className="no-underline">{card}</Link>;
}
