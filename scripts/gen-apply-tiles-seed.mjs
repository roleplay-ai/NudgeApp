/**
 * Generates supabase/seed_012_apply_tiles_ai_features_guide.sql from seed_011 (same source copy).
 * Run: node scripts/gen-apply-tiles-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const seed011 = fs.readFileSync(path.join(root, "supabase", "seed_011_apply_videos_from_ai_features_guide.sql"), "utf8");

const TILE_MARKER = "[seed:ai-features-guide-tiles-v1]";

const DISPLAY_ORDER = [
  "Design infographics",
  "Design dashboards",
  "AI browsers",
  "Design slides (PPT)",
  "Data analytics",
  "Create agents & automation",
  "Vibe coding",
  "Canvas",
  "Notebook",
  "Projects",
  "Connect apps",
  "Custom instructions",
  "Memories",
  "Temporary chats",
  "Thinking models",
  "Design images",
  "Deep research",
  "Scheduled actions",
  "Design videos",
  "AI in Excel",
  "Gems (custom chatbots)",
  "Guided learning & quizzes",
];

const GROUP_BY_TITLE = {
  "Design infographics": "Workflows",
  "Design dashboards": "Workflows",
  "Design slides (PPT)": "Workflows",
  "Data analytics": "Workflows",
  "Design images": "Workflows",
  "Design videos": "Workflows",
  "AI browsers": "Apps",
  "Create agents & automation": "Skills",
  "Vibe coding": "Skills",
};

const ACCENTS = ["#A855F7", "#EC4899", "#F59E0B", "#3B82F6", "#23CE68", "#ED4551"];

const NAME_COLORS = {
  ChatGPT: "#23CE68",
  Claude: "#D97757",
  Gemini: "#4285F4",
  Copilot: "#0078D4",
  "Google AI Studio": "#FBBC04",
  "Copilot Studio": "#0078D4",
  "Codex (OpenAI)": "#10A37F",
  "Claude Code": "#D97757",
  "Comet (Perplexity)": "#8B5CF6",
  "Operator/Atlas (OpenAI)": "#10A37F",
};

function parseRows() {
  const after = seed011.split("VALUES")[1]?.split(");")[0];
  if (!after) throw new Error("Could not parse seed_011 VALUES");
  const rawChunks = after.split(/\),\s*\n\(/);
  const rows = [];
  for (let i = 0; i < rawChunks.length; i++) {
    let ch = rawChunks[i].trim();
    if (i === 0) ch = ch.replace(/^\(/, "");
    const titleM = /'([^']*)'/.exec(ch);
    const descM = /\$c\d+\$([\s\S]*?)\[seed:ai-features-guide-v1\]\$c\d+\$/.exec(ch);
    const urlM = /'(https:\/\/[^']+\.mp4)'/.exec(ch);
    if (!titleM || !descM || !urlM) throw new Error(`Bad chunk ${i}: ${ch.slice(0, 80)}`);
    const title = titleM[1];
    const fullDesc = descM[1].trimEnd();
    const videoUrl = urlM[1];
    const parts = fullDesc.split(/\n\n+/);
    const subtitle = (parts[0] || "").trim();
    const bodyParts = parts.slice(1);
    const platformsLine = bodyParts.find((p) => p.trimStart().startsWith("Platforms:")) || "";
    const bodyOnly = bodyParts.filter((p) => !p.trimStart().startsWith("Platforms:")).join("\n\n").trim();
    const whatItDoes = `${bodyOnly}\n\n${platformsLine}\n\n${TILE_MARKER}`.trim();
    rows.push({ title, subtitle, whatItDoes, videoUrl, platformsLine: platformsLine.trim() });
  }
  return rows;
}

function escSqlString(s) {
  return s.replace(/'/g, "''");
}

function main() {
  const parsed = parseRows();
  const byTitle = new Map(parsed.map((r) => [r.title, r]));

  const lines = [];
  lines.push(`-- ============================================`);
  lines.push(`-- Seed apply_tiles from AI_Features_Guide (same copy as seed_011)`);
  lines.push(`-- ============================================`);
  lines.push(`-- Top "What can AI do?" grid. Run after migration_010 / migration_011 (estimated_duration).`);
  lines.push(`-- Walkthrough duplicates: seed_011 rows are is_published = false — publish in Admin if you want clips below.`);
  lines.push(`-- Safe re-run: DELETE rows with tile seed marker in what_it_does, then INSERT.`);
  lines.push(`-- ============================================`);
  lines.push(``);
  lines.push(`DELETE FROM public.apply_tiles`);
  lines.push(`WHERE what_it_does LIKE '%${TILE_MARKER}%';`);
  lines.push(``);
  lines.push(`INSERT INTO public.apply_tiles`);
  lines.push(
    `  (title, subtitle, group_name, is_featured, order_index, icon_color, category_tag, what_it_does, video_url, available_in, estimated_duration)`,
  );
  lines.push(`VALUES`);

  const valueLines = [];
  for (let i = 0; i < DISPLAY_ORDER.length; i++) {
    const title = DISPLAY_ORDER[i];
    const r = byTitle.get(title);
    if (!r) throw new Error(`Missing row for title: ${title}`);
    const group = GROUP_BY_TITLE[title] || "Features";
    const color = ACCENTS[i % ACCENTS.length];
    const jsonInner = JSON.stringify(
      (() => {
        const m = r.platformsLine.match(/^Platforms:\s*(.+)$/);
        if (!m) return [];
        return m[1]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ name, color: NAME_COLORS[name] || "#6B6B6B" }));
      })(),
    ).replace(/'/g, "''");

    valueLines.push(
      `(\n  '${escSqlString(r.title)}',\n  '${escSqlString(r.subtitle)}',\n  '${group}',\n  false,\n  ${i},\n  '${color}',\n  NULL,\n  '${escSqlString(r.whatItDoes)}',\n  '${escSqlString(r.videoUrl)}',\n  '${jsonInner}'::jsonb,\n  '~1 min'\n)`,
    );
  }

  lines.push(valueLines.join(",\n"));
  lines.push(`;`);

  const outPath = path.join(root, "supabase", "seed_012_apply_tiles_ai_features_guide.sql");
  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
  console.log("Wrote", outPath);
}

main();
