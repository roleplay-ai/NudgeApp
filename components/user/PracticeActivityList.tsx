"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Lock, Zap } from "lucide-react";
import type { PracticeActivity, PracticeSession } from "@/lib/types";

const ALL_FILTER = "All";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald bg-emerald/10 border-emerald/30",
  Medium: "text-norange bg-norange/10 border-norange/30",
  Hard: "text-fuchsia bg-fuchsia/10 border-fuchsia/30",
};

function scorePercent(session: PracticeSession | undefined) {
  if (!session || session.max_possible == null || session.max_possible === 0) return null;
  return Math.round(((session.total_score ?? 0) / session.max_possible) * 100);
}

function ScoreBar({ pct, color }: { pct: number; color: string }) {
  const barColor = pct >= 80 ? "#22c55e" : pct >= 55 ? color : "#ef4444";
  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-homeBodyMuted">YOUR SCORE</span>
        <span className="text-[11px] font-black" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-nborder overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

export default function PracticeActivityList({
  activities,
  sessionMap,
  isLoggedIn,
}: {
  activities: PracticeActivity[];
  sessionMap: Record<string, PracticeSession>;
  isLoggedIn: boolean;
}) {
  const categories = [ALL_FILTER, ...Array.from(new Set(activities.map((a) => a.category)))];
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);

  const filtered = activeCategory === ALL_FILTER
    ? activities
    : activities.filter((a) => a.category === activeCategory);

  const completedCount = Object.keys(sessionMap).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-extrabold text-homeInk tracking-tight">
          Pick what you want to practice
        </h2>
        <span className="text-xs text-homeBodyMuted font-semibold">
          {completedCount} of {activities.length} completed
        </span>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              activeCategory === cat
                ? "text-white border-transparent"
                : "bg-white text-homeInk border-nborder hover:border-homeClay/40"
            }`}
            style={activeCategory === cat ? { backgroundColor: "#C07B3A" } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((activity) => {
          const session = sessionMap[activity.id];
          const pct = scorePercent(session);
          const isDone = !!session;
          const isLocked = activity.is_locked && !isLoggedIn;
          const href = isLoggedIn ? `/practice/${activity.id}` : "/login";

          const inner = (
            <div
              className="rounded-2xl border overflow-hidden transition-shadow"
              style={{
                background: isLocked ? "#F7F5F2" : "#ffffff",
                borderColor: isLocked ? "rgba(34,29,35,0.08)" : isDone ? `${activity.color}50` : "#E8E6DC",
              }}
            >
              {/* Top accent strip */}
              <div
                className="h-1 w-full"
                style={{
                  background: isLocked ? "rgba(34,29,35,0.07)" : isDone ? "#23CE68" : activity.color,
                }}
              />

              <div className="p-5">
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                    style={{
                      backgroundColor: isLocked ? "#1c1814" : activity.color,
                      color: isLocked ? "#FFCE00" : "#ffffff",
                    }}
                  >
                    {isLocked ? <Lock size={18} strokeWidth={2.5} /> : activity.icon}
                  </div>
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-shadow/5 text-muted border border-shadow/10">
                      <Lock size={9} strokeWidth={3} /> LOGIN TO UNLOCK
                    </span>
                  ) : isDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald/15 text-emerald">
                      <CheckCircle2 size={11} strokeWidth={2.5} /> DONE
                    </span>
                  ) : null}
                </div>

                {/* Category */}
                <div
                  className="text-[10px] font-black tracking-[1.5px] uppercase mb-1"
                  style={{ color: isLocked ? "#b0a090" : activity.color }}
                >
                  {activity.category}
                </div>

                {/* Name */}
                <div
                  className="font-extrabold text-base mb-2 leading-snug"
                  style={{ color: isLocked ? "#b0a090" : "#1c1814" }}
                >
                  {activity.name}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs" style={{ color: isLocked ? "#c0b0a0" : "#6b5f52" }}>
                  <span className="flex items-center gap-1"><Clock size={11} /> {activity.time_minutes} min</span>
                  {!isLocked && (
                    <span className="flex items-center gap-1 font-semibold text-homeClay">
                      <Zap size={11} /> +{activity.xp_reward} XP
                    </span>
                  )}
                  {!isLocked && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${DIFFICULTY_COLORS[activity.difficulty] || ""}`}>
                      {activity.difficulty}
                    </span>
                  )}
                </div>

                {/* Score bar */}
                {!isLocked && isDone && pct !== null ? (
                  <ScoreBar pct={pct} color={activity.color} />
                ) : (
                  <div className="mb-4" />
                )}

                {/* CTA */}
                {!isLocked && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-homeBodyMuted font-semibold">
                      {isDone ? "Try again" : "Start activity"}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: activity.color }}
                    >
                      <ArrowRight size={16} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );

          return isLocked ? (
            <div key={activity.id}>{inner}</div>
          ) : (
            <Link key={activity.id} href={href} className="no-underline block group">
              {inner}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-homeBodyMuted text-center py-12">No activities in this category yet.</p>
      )}
    </div>
  );
}
