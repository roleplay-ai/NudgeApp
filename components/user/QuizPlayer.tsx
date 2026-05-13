"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, LogIn, Trophy, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { awardPointsAction } from "@/app/actions/awardPointsAction";

const PENDING_KEY = "nudgeable_pending_quiz_points";

interface PendingEntry {
  quizId: string;
  quizTitle: string;
  points: number;
  ts: number;
}

interface Props {
  quiz: Quiz;
  questions: QuizQuestion[];
  isLoggedIn: boolean;
}

// ── Circular countdown ring ───────────────────────────────────────────────────

function TimerRing({
  timeLeft,
  total,
  locked,
}: {
  timeLeft: number;
  total: number;
  locked: boolean;
}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const pct = locked ? (timeLeft > 0 ? timeLeft / total : 0) : timeLeft / total;
  const offset = circumference * (1 - pct);

  const trackColor = "rgba(34,29,35,0.08)";
  const ringColor =
    timeLeft <= 0
      ? "#ED4551"
      : pct > 0.5
      ? "#23CE6B"
      : pct > 0.25
      ? "#F68A29"
      : "#ED4551";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 38, height: 38 }}>
      <svg
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
        viewBox="0 0 36 36"
        width={38}
        height={38}
      >
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="3"
        />
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease" }}
        />
      </svg>
      <span
        className="relative text-[11px] font-black tabular-nums leading-none"
        style={{ color: ringColor }}
      >
        {timeLeft <= 0 ? "0" : timeLeft}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuizPlayer({ quiz, questions, isLoggedIn }: Props) {
  const total = questions.length;

  // Per-question preserved state (survives back navigation)
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null)
  );
  const [timedOut, setTimedOut] = useState<boolean[]>(() =>
    questions.map(() => false)
  );

  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.time_per_question);
  const [done, setDone] = useState(false);
  const [awarding, setAwarding] = useState(false);

  // Tracks which steps have already had points awarded (prevents double-counting for guests)
  const awardedSteps = useRef(new Set<number>());
  // Running guest point total
  const [sessionPoints, setSessionPoints] = useState(0);

  const router = useRouter();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Derived state for the current question
  const q = questions[step];
  const options = q.quiz_options?.map((o) => o.option_text) ?? [];
  const correctIndex = q.quiz_options?.findIndex((o) => o.is_correct) ?? -1;
  const currentAnswer = answers[step];
  const currentTimedOut = timedOut[step];
  const isLocked = currentAnswer !== null || currentTimedOut; // can't change answer
  const isCorrect = currentAnswer === correctIndex && !currentTimedOut;
  const isLastQuestion = step === total - 1;
  const questionPoints = q.points_award ?? quiz.points_per_question;

  // ── Timer ───────────────────────────────────────────────────────────────────

  // Reset timer whenever the step changes
  useEffect(() => {
    const alreadyDone = answers[step] !== null || timedOut[step];
    setTimeLeft(alreadyDone ? 0 : quiz.time_per_question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Count down; expire when it hits 0
  useEffect(() => {
    if (isLocked || done) return;
    if (timeLeft <= 0) {
      setTimedOut((prev) => {
        const next = [...prev];
        next[step] = true;
        return next;
      });
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, isLocked, done, step]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  async function handleContinue() {
    if (!isLocked || awarding) return;

    // Award points for a correct answer the first time we leave this step
    if (isCorrect && !awardedSteps.current.has(step)) {
      awardedSteps.current.add(step);
      if (isLoggedIn) {
        setAwarding(true);
        await awardPointsAction({
          sourceType: "quiz_question",
          sourceId: q.id,
          pointsAward: q.points_award,
          defaultPoints: quiz.points_per_question,
        });
        setAwarding(false);
      } else {
        setSessionPoints((p) => p + questionPoints);
      }
    }

    if (isLastQuestion) {
      // Completion bonus
      if (quiz.completion_bonus > 0) {
        if (isLoggedIn) {
          setAwarding(true);
          await awardPointsAction({
            sourceType: "quiz",
            sourceId: quiz.id,
            pointsAward: quiz.completion_bonus,
            defaultPoints: quiz.completion_bonus,
          });
          setAwarding(false);
        } else {
          setSessionPoints((p) => p + quiz.completion_bonus);
        }
      }
      router.refresh();
      setDone(true);
      return;
    }

    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step === 0 || done) return;
    setStep((s) => s - 1);
  }

  function handleClose() {
    router.push("/play");
  }

  function selectAnswer(idx: number) {
    if (isLocked) return; // timed-out or already answered
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = idx;
      return next;
    });
  }

  function handleLoginToSave() {
    const pts = sessionPoints;
    if (pts > 0) {
      try {
        const existing: PendingEntry[] = JSON.parse(
          localStorage.getItem(PENDING_KEY) || "[]"
        );
        const filtered = existing.filter((e) => e.quizId !== quiz.id);
        filtered.push({ quizId: quiz.id, quizTitle: quiz.title, points: pts, ts: Date.now() });
        localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
      } catch {
        // localStorage unavailable
      }
    }
    router.push("/login?redirect=/play");
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) * 1.4 || Math.abs(dx) < 48 || done) return;
    if (dx < 0 && isLocked) handleContinue();
    else if (dx > 0 && step > 0) handleBack();
  }

  // ── Empty guard ─────────────────────────────────────────────────────────────

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Trophy size={40} className="text-muted opacity-30" />
        <p className="text-sm text-muted">This quiz has no questions yet.</p>
        <button type="button" onClick={handleClose}
          className="px-6 py-2.5 rounded-full bg-shadow text-white text-sm font-semibold">
          ← Back to quizzes
        </button>
      </div>
    );
  }

  // ── Completion screen ───────────────────────────────────────────────────────

  if (done) {
    const correctCount = answers.filter((a, i) => {
      const ci = questions[i].quiz_options?.findIndex((o) => o.is_correct) ?? -1;
      return a === ci;
    }).length;
    const finalPoints = isLoggedIn ? correctCount * (quiz.points_per_question) : sessionPoints;

    return (
      <div
        className="w-full max-w-lg mx-auto rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: "#1c1814",
          boxShadow: "0 28px 72px rgba(0,0,0,0.40)",
          border: "1px solid rgba(255,255,255,0.06)",
          minHeight: 480,
        }}
      >
        <div className="h-1 w-full flex-shrink-0"
          style={{ background: "linear-gradient(90deg, #FFCE00, #FFCE0055, transparent)" }} />

        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <button type="button" onClick={handleClose}
            className="rounded-full p-1.5 transition hover:bg-white/8"
            style={{ color: "rgba(245,240,216,0.40)" }}>
            <X size={20} />
          </button>
          <span className="text-[11px] font-black tracking-[0.15em]"
            style={{ color: "rgba(255,206,0,0.60)" }}>
            QUIZ COMPLETE
          </span>
          <div className="w-8" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,206,0,0.28) 0%, transparent 70%)", transform: "scale(2.4)" }} />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#FFCE00", boxShadow: "0 0 40px rgba(255,206,0,0.40)" }}>
              <Trophy size={34} color="#221D23" strokeWidth={2.5} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#F5F0D8" }}>
              {correctCount === total ? "Perfect score!" : correctCount >= total * 0.7 ? "Well done!" : "Quiz finished!"}
            </h2>
            <p className="text-sm" style={{ color: "rgba(245,240,216,0.55)" }}>
              You got{" "}
              <span className="font-bold text-amber">{correctCount}</span>{" "}
              out of{" "}
              <span className="font-bold text-amber">{total}</span> correct
            </p>
          </div>

          {finalPoints > 0 && (
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl"
              style={{ background: "rgba(255,206,0,0.10)", border: "1px solid rgba(255,206,0,0.22)" }}>
              <Zap size={16} className="text-amber" strokeWidth={2.5} />
              <span className="font-extrabold text-amber text-lg tabular-nums">+{finalPoints}</span>
              <span className="text-sm font-semibold" style={{ color: "rgba(245,240,216,0.60)" }}>
                {isLoggedIn ? "points earned" : "points to save"}
              </span>
            </div>
          )}

          {!isLoggedIn && finalPoints > 0 && (
            <div className="w-full space-y-3">
              <p className="text-xs" style={{ color: "rgba(245,240,216,0.40)" }}>
                Log in to save your progress and keep your points.
              </p>
              <button type="button" onClick={handleLoginToSave}
                className="w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "#FFCE00", color: "#221D23" }}>
                <LogIn size={15} strokeWidth={2.5} />
                Login to save {finalPoints} pts
              </button>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2">
          <button type="button" onClick={handleClose}
            className="w-full py-3 rounded-full font-bold text-sm transition"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(245,240,216,0.70)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            Back to quizzes
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ─────────────────────────────────────────────────────────

  const accent = { color: quiz.color, bg: `${quiz.color}14` };

  return (
    <div
      className="w-full max-w-lg mx-auto rounded-2xl flex flex-col select-none overflow-hidden"
      style={{
        background: "#ffffff",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        border: "1px solid rgba(34,29,35,0.09)",
        minHeight: 480,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Accent strip — turns red when timed out */}
      <div className="h-1 w-full flex-shrink-0 transition-colors duration-500"
        style={{
          background: currentTimedOut
            ? "linear-gradient(90deg, #ED4551, #ED455155, transparent)"
            : `linear-gradient(90deg, ${accent.color}, ${accent.color}55, transparent)`,
        }} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-3 flex-shrink-0">
        <button type="button"
          onClick={step > 0 ? handleBack : handleClose}
          className="rounded-full p-1.5 transition hover:bg-black/6"
          style={{ color: "#9e8e7a" }}>
          {step > 0 ? <ChevronLeft size={20} /> : <X size={20} />}
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => {
            const isPast = i < step;
            const isCurrent = i === step;
            const wasTimedOut = timedOut[i];
            const wasAnswered = answers[i] !== null;
            const wasCorrect =
              wasAnswered &&
              answers[i] === (questions[i].quiz_options?.findIndex((o) => o.is_correct) ?? -1);

            let dotColor = "rgba(34,29,35,0.10)";
            if (isPast || (isCurrent && isLocked)) {
              if (wasTimedOut) dotColor = "#ED4551";
              else if (wasCorrect) dotColor = "#23CE6B";
              else dotColor = "#ED4551";
            } else if (isCurrent) {
              dotColor = accent.color;
            }

            return (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: isCurrent ? "22px" : "8px", background: dotColor }} />
            );
          })}
        </div>

        {/* Timer ring */}
        <TimerRing
          timeLeft={timeLeft}
          total={quiz.time_per_question}
          locked={isLocked}
        />
      </div>

      {/* Badge */}
      <div className="px-5 pb-3 flex-shrink-0">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.18em] px-2.5 py-1 rounded-full"
          style={{
            background: currentTimedOut ? "rgba(237,69,81,0.08)" : accent.bg,
            color: currentTimedOut ? "#ED4551" : accent.color,
            border: `1px solid ${currentTimedOut ? "#ED455130" : `${accent.color}30`}`,
          }}>
          <Zap size={9} strokeWidth={2.5} />
          {currentTimedOut ? "TIME'S UP" : "KNOWLEDGE CHECK"}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ minHeight: 0 }}>

        {/* Question */}
        <div className="rounded-2xl px-4 py-4 mb-4"
          style={{
            background: currentTimedOut ? "rgba(237,69,81,0.06)" : `${accent.color}0f`,
            border: `1px solid ${currentTimedOut ? "#ED455125" : `${accent.color}30`}`,
          }}>
          <p className="text-base font-bold text-shadow leading-snug">{q.question}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const sel = currentAnswer === i;
            const correct = i === correctIndex;
            const revealed = isLocked; // locked = answered OR timed-out

            let style: React.CSSProperties = {
              background: "#FAFAF8",
              border: "1.5px solid rgba(34,29,35,0.12)",
              color: "#221D23",
            };
            let letterStyle: React.CSSProperties = {
              background: "rgba(34,29,35,0.07)",
              color: "#6B6B6B",
            };

            if (!revealed && sel) {
              // Selected but not yet locked
              style = { background: "#EEEDFE", border: "1.5px solid #623CEA", color: "#3C3489" };
              letterStyle = { background: "#623CEA", color: "#fff" };
            }
            if (revealed && correct) {
              // Always highlight correct after reveal (answered OR timed out)
              style = { background: "#EDFBF3", border: "1.5px solid #23CE6B", color: "#0A6632" };
              letterStyle = { background: "#23CE6B", color: "#fff" };
            }
            if (revealed && sel && !correct) {
              // User's wrong choice
              style = { background: "#FEF0EE", border: "1.5px solid #ED4551", color: "#8C1C24" };
              letterStyle = { background: "#ED4551", color: "#fff" };
            }
            // Timed out + not selected + not correct → dim
            if (currentTimedOut && !sel && !correct) {
              style = { background: "#F8F7F5", border: "1.5px solid rgba(34,29,35,0.07)", color: "#b0a090" };
              letterStyle = { background: "rgba(34,29,35,0.04)", color: "#c0b0a0" };
            }

            return (
              <button key={i}
                onClick={() => selectAnswer(i)}
                className="text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
                style={{ ...style, cursor: revealed ? "default" : "pointer" }}>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-all"
                  style={letterStyle}>
                  {revealed && correct
                    ? <Check size={13} strokeWidth={3} />
                    : String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isLocked && (
          <div
            className="mt-3 rounded-xl px-4 py-3 text-xs leading-relaxed font-medium"
            style={
              currentTimedOut
                ? { background: "rgba(237,69,81,0.08)", color: "#8C1C24", border: "1px solid rgba(237,69,81,0.20)" }
                : isCorrect
                ? { background: "rgba(35,206,107,0.10)", color: "#0A6632", border: "1px solid rgba(35,206,107,0.25)" }
                : { background: "rgba(237,69,81,0.08)", color: "#8C1C24", border: "1px solid rgba(237,69,81,0.20)" }
            }>
            {currentTimedOut
              ? `⏱ Time's up! The correct answer is highlighted above.`
              : isCorrect
              ? <>
                  ✓ {q.feedback_correct}
                  {questionPoints > 0 && (
                    <span className="ml-2 inline-flex items-center gap-0.5 font-black">
                      <Zap size={10} strokeWidth={3} />+{questionPoints}
                    </span>
                  )}
                </>
              : `✗ ${q.feedback_incorrect}`}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-5 pb-6 pt-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(34,29,35,0.07)" }}>
        <button
          onClick={handleContinue}
          disabled={!isLocked || awarding}
          className="w-full py-3 rounded-full font-bold text-sm transition-all active:scale-[0.98]"
          style={{
            background: !isLocked ? "rgba(34,29,35,0.06)" : awarding ? accent.color : accent.color,
            color: !isLocked ? "#b0a090" : "#ffffff",
            opacity: awarding ? 0.6 : 1,
            cursor: !isLocked ? "not-allowed" : awarding ? "wait" : "pointer",
            boxShadow: !isLocked || awarding ? "none" : `0 4px 18px ${accent.color}40`,
          }}>
          {awarding
            ? "Saving…"
            : !isLocked
            ? `Answer to continue (${timeLeft}s)`
            : isLastQuestion
            ? "Finish →"
            : "Continue →"}
        </button>
      </div>
    </div>
  );
}
