import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });

// Appended to every assessment prompt so the admin cannot accidentally alter the return shape.
const ASSESSMENT_JSON_SUFFIX = `

---
Assess ALL of the user's prompts combined as a single body of work.
Return ONLY valid JSON — no other text before or after:
{
  "scores": [
    {
      "rubric_name": "<exact criterion name from your rubric above>",
      "score": <points awarded>,
      "max_score": <maximum points for this criterion>,
      "feedback": "<1-2 sentence feedback>"
    }
  ]
}`;

function buildUserContent(msgs: { role: string; content: string }[], activity: { name?: string; description?: string } | null) {
  const userPrompts = msgs
    .filter((m) => m.role === "user")
    .map((m, i) => `[${i + 1}] ${m.content}`)
    .join("\n\n");

  return `Activity: ${activity?.name || "Prompt Engineering Practice"}
Brief: ${activity?.description || ""}

The user sent ${msgs.filter((m) => m.role === "user").length} prompt(s) in total:

${userPrompts}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();

    // ── GUEST MODE ──
    if (!user) {
      const { activityId, guestMessages } = body;
      if (!activityId) return NextResponse.json({ error: "activityId required" }, { status: 400 });
      if (!guestMessages?.length) return NextResponse.json({ error: "No messages to assess" }, { status: 400 });

      const userOnly = (guestMessages as { role: string; content: string }[]).filter((m) => m.role === "user");
      if (userOnly.length === 0) return NextResponse.json({ error: "No user prompts to assess" }, { status: 400 });

      const { data: activity } = await admin
        .from("practice_activities")
        .select("name, description, assessment_prompt")
        .eq("id", activityId)
        .single();

      const systemPrompt = ((activity as any)?.assessment_prompt || "") + ASSESSMENT_JSON_SUFFIX;
      const userContent = buildUserContent(guestMessages, activity as any);

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      });

      const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
      let parsed: { scores: { rubric_name: string; score: number; max_score: number; feedback: string }[] };
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
      } catch {
        return NextResponse.json({ error: "Failed to parse assessment response" }, { status: 500 });
      }

      const validScores = (parsed.scores || []).map((s) => ({
        rubric_name: s.rubric_name || "",
        score: Math.max(0, Math.min(s.max_score ?? 100, Math.round(s.score ?? 0))),
        max_score: s.max_score ?? 100,
        feedback: s.feedback || "",
      }));

      const totalScore = validScores.reduce((sum, s) => sum + s.score, 0);
      const maxPossible = validScores.reduce((sum, s) => sum + s.max_score, 0);

      return NextResponse.json({ scores: validScores, totalScore, maxPossible, guest: true });
    }

    // ── AUTHENTICATED MODE ──
    const { sessionId } = body;
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const { data: session } = await supabase
      .from("practice_sessions")
      .select("*, practice_activities(name, description, assessment_prompt, xp_reward)")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    const { data: messages } = await supabase
      .from("practice_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at");

    if (!messages || messages.length === 0) return NextResponse.json({ error: "No messages to assess" }, { status: 400 });

    const userOnly = messages.filter((m: any) => m.role === "user");
    if (userOnly.length === 0) return NextResponse.json({ error: "No user prompts to assess" }, { status: 400 });

    const activity = (session as any).practice_activities;
    const systemPrompt = (activity?.assessment_prompt || "") + ASSESSMENT_JSON_SUFFIX;
    const userContent = buildUserContent(messages as any[], activity);

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
    let parsed: { scores: { rubric_name: string; score: number; max_score: number; feedback: string }[] };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return NextResponse.json({ error: "Failed to parse assessment response" }, { status: 500 });
    }

    const validScores = (parsed.scores || []).map((s: any) => ({
      session_id: sessionId,
      rubric_id: null,
      rubric_name: s.rubric_name || "",
      score: Math.max(0, Math.min(s.max_score ?? 100, Math.round(s.score ?? 0))),
      max_score: s.max_score ?? 100,
      feedback: s.feedback || "",
    }));

    const totalScore = validScores.reduce((sum: number, s: any) => sum + s.score, 0);
    const maxPossible = validScores.reduce((sum: number, s: any) => sum + s.max_score, 0);

    if (validScores.length > 0) {
      await supabase.from("practice_scores").insert(validScores);
    }

    await supabase
      .from("practice_sessions")
      .update({ submitted_at: new Date().toISOString(), total_score: totalScore, max_possible: maxPossible })
      .eq("id", sessionId);

    const xpReward = Number(activity?.xp_reward ?? 0);
    const xpEarned = maxPossible > 0 ? Math.round(xpReward * (totalScore / maxPossible)) : 0;
    let xpDelta = 0;
    if (xpReward > 0) {
      const { data: delta, error: xpError } = await supabase.rpc("complete_practice", {
        p_user: user.id,
        p_activity: session.activity_id,
        p_xp: xpEarned,
      });
      if (xpError) {
        console.error("[practice/submit] complete_practice failed:", xpError.message, xpError);
      } else {
        xpDelta = delta as number;
        // Track the same net delta in the practice-specific XP column
        if (xpDelta !== 0) {
          await admin.rpc("add_practice_xp", { p_user: user.id, p_delta: xpDelta });
        }
        revalidatePath("/", "layout");
        revalidatePath("/");
        revalidatePath("/practice");
        revalidatePath("/profile");
      }
    }

    // Strip session_id / rubric_id from the client response
    const enrichedScores = validScores.map((s: any) => ({
      rubric_name: s.rubric_name,
      score: s.score,
      max_score: s.max_score,
      feedback: s.feedback,
    }));

    return NextResponse.json({ scores: enrichedScores, totalScore, maxPossible, xpEarned, xpDelta });
  } catch (err: any) {
    console.error("[practice/submit]", err);
    const isOverloaded = err?.status === 529 || err?.error?.type === "overloaded_error";
    return NextResponse.json(
      { error: isOverloaded ? "AI is busy — please try again in a moment." : (err.message || "Internal error") },
      { status: isOverloaded ? 503 : 500 }
    );
  }
}
