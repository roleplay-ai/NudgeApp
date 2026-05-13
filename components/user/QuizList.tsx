"use client";

import Link from "next/link";
import { Lock, Trophy, Zap } from "lucide-react";
import type { Quiz } from "@/lib/types";

export default function QuizList({
  quizzes,
  isLoggedIn,
}: {
  quizzes: Quiz[];
  isLoggedIn: boolean;
}) {
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
        return (
          <QuizCard key={quiz.id} quiz={quiz} locked={locked} />
        );
      })}
    </div>
  );
}

function QuizCard({ quiz, locked }: { quiz: Quiz; locked: boolean }) {
  const totalPoints = quiz.points_per_question > 0 || quiz.completion_bonus > 0;

  const card = (
    <div
      className="relative rounded-2xl border overflow-hidden transition-all duration-200 select-none"
      style={{
        background: locked ? "#F5F3F0" : "#ffffff",
        borderColor: locked ? "rgba(34,29,35,0.08)" : "rgba(34,29,35,0.10)",
        boxShadow: locked ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
        cursor: locked ? "default" : "pointer",
      }}
    >
      {/* Accent strip */}
      <div
        className="h-1 w-full"
        style={{
          background: locked
            ? "rgba(34,29,35,0.08)"
            : `linear-gradient(90deg, ${quiz.color}, ${quiz.color}55, transparent)`,
        }}
      />

      <div className="p-5">
        {/* Emoji + lock */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl leading-none">{quiz.emoji}</span>
          {locked && (
            <span className="flex items-center gap-1 text-[10px] font-black tracking-wide px-2 py-1 rounded-full bg-shadow/8 text-muted border border-shadow/10">
              <Lock size={9} strokeWidth={3} />
              LOGIN TO UNLOCK
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
          {totalPoints && !locked && (
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
          )}
          {!locked && (
            <span
              className="ml-auto text-xs font-bold"
              style={{ color: quiz.color }}
            >
              Play →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (locked) return card;
  return <Link href={`/play/${quiz.id}`} className="no-underline">{card}</Link>;
}
