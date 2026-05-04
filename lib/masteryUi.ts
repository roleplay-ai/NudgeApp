/** Progress copy + bar fill aligned with sidebar mastery card (reference UI). */
const STEP = [40, 55, 70, 85, 100];
/** Title earned when you reach the same-index threshold. */
const AT = ["AI Aware", "AI Literate", "AI Practitioner", "AI Pro", "AI Expert"];

export function masteryFromScore(score: number) {
  const s = Math.max(0, Math.min(100, score));
  const nextIdx = STEP.findIndex((x) => x > s);
  const next = nextIdx === -1 ? 100 : STEP[nextIdx];
  const prev = nextIdx <= 0 ? 0 : STEP[nextIdx - 1];
  const nextName = nextIdx === -1 ? "" : AT[nextIdx] ?? "next level";
  const pts = nextIdx === -1 ? 0 : Math.max(0, next - s);
  const rawPct = nextIdx === -1 ? 100 : prev >= next ? 0 : ((s - prev) / (next - prev)) * 100;
  const barPct = Math.min(100, Math.max(6, Math.round(rawPct)));

  return {
    displayScore: s,
    subline: nextIdx === -1 ? "Peak level — keep practicing" : `${pts} pts to ${nextName}`,
    barPct,
  };
}
