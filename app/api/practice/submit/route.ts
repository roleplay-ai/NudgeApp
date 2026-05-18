import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Build the assessment user-content block from a flat message list. */
function buildAssessmentContent(
  msgs: { role: string; content: string }[],
  rubrics: any[],
  activity: { name?: string; description?: string } | null
) {
  const userPrompts = msgs
    .filter((m) => m.role === "user")
    .map((m, i) => `[${i + 1}] ${m.content}`)
    .join("\n\n");

  const rubricList = rubrics
    .map((r: any) => `- ${r.name} (max ${r.max_score} pts): ${r.description || ""}`)
    .join("\n");

  const rubricIds = rubrics
    .map((r: any) => `- ${r.name}: ${r.id}`)
    .join("\n");

  return `Activity: ${activity?.name || "Prompt Engineering Practice"}
Brief: ${activity?.description || ""}

Rubric criteria:
${rubricList}

Rubric IDs for reference:
${rubricIds}

The user sent ${msgs.filter((m) => m.role === "user").length} prompt(s) in total. Assess them combined as a single body of work:

${userPrompts}

Score each rubric criterion based on ALL the user's prompts taken together. Return JSON only.`;
}

const DEFAULT_ASSESSMENT_SYSTEM = `You are an expert prompt engineering assessor. Review the user's prompts and score them as a combined body of work.

Return ONLY valid JSON in this exact format:
{
  "scores": [
    {
      "rubric_id": "<rubric id>",
      "score": <number>,
      "feedback": "<feedback text>"
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ── GUEST MODE ── (guestMessages + activityId + guestRubrics, no DB persistence)
    if (!user) {
      const { activityId, guestMessages, guestRubrics } = body;
      if (!activityId) return NextResponse.json({ error: "activityId required" }, { status: 400 });
      if (!guestMessages?.length) return NextResponse.json({ error: "No messages to assess" }, { status: 400 });

      const userOnly = (guestMessages as { role: string; content: string }[]).filter((m) => m.role === "user");
      if (userOnly.length === 0) return NextResponse.json({ error: "No user prompts to assess" }, { status: 400 });

      // Rubrics come from the client (already available on the page) — no DB query needed
      const rubrics: any[] = guestRubrics ?? [];
      if (rubrics.length === 0) {
        return NextResponse.json({ error: "No rubrics defined for this activity" }, { status: 400 });
      }

      // Fetch only the assessment_prompt using admin client (small, safe read)
      const admin = createAdminClient();
      const { data: activity } = await admin
        .from("practice_activities")
        .select("name, description, assessment_prompt")
        .eq("id", activityId)
        .single();

      const assessmentSystemPrompt = (activity as any)?.assessment_prompt || DEFAULT_ASSESSMENT_SYSTEM;
      const userContent = buildAssessmentContent(guestMessages, rubrics, activity as any);

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: assessmentSystemPrompt,
        messages: [{ role: "user", content: userContent }],
      });

      const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
      let parsed: { scores: { rubric_id: string; score: number; feedback: string }[] };
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
      } catch {
        return NextResponse.json({ error: "Failed to parse assessment response" }, { status: 500 });
      }

      const rubricMap = Object.fromEntries(rubrics.map((r: any) => [r.id, r]));
      const validScores = (parsed.scores || []).map((s: any) => {
        const rubric = rubricMap[s.rubric_id];
        const maxScore = rubric?.max_score ?? 25;
        return {
          rubric_id: s.rubric_id,
          score: Math.max(0, Math.min(maxScore, Math.round(s.score))),
          feedback: s.feedback || "",
          name: rubric?.name ?? "",
          max_score: maxScore,
        };
      });

      const totalScore = validScores.reduce((sum, s) => sum + s.score, 0);
      const maxPossible = rubrics.reduce((sum: number, r: any) => sum + r.max_score, 0);

      return NextResponse.json({ scores: validScores, totalScore, maxPossible, guest: true });
    }

    // ── AUTHENTICATED MODE ── (DB-backed session)
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

    const admin = createAdminClient();
    const { data: rubrics } = await admin
      .from("practice_rubrics")
      .select("*")
      .eq("activity_id", session.activity_id);

    if (!rubrics || rubrics.length === 0) {
      return NextResponse.json({ error: "No rubrics defined for this activity" }, { status: 400 });
    }

    const { data: messages } = await supabase
      .from("practice_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at");

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages to assess" }, { status: 400 });
    }

    const userOnly = messages.filter((m: any) => m.role === "user");
    if (userOnly.length === 0) {
      return NextResponse.json({ error: "No user prompts to assess" }, { status: 400 });
    }

    const activity = (session as any).practice_activities;
    const assessmentSystemPrompt = activity?.assessment_prompt || DEFAULT_ASSESSMENT_SYSTEM;
    const userContent = buildAssessmentContent(messages as any[], rubrics, activity);

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: assessmentSystemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: { scores: { rubric_id: string; score: number; feedback: string }[] };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return NextResponse.json({ error: "Failed to parse assessment response" }, { status: 500 });
    }

    const rubricMap = Object.fromEntries(rubrics.map((r: any) => [r.id, r]));
    const validScores = (parsed.scores || []).map((s: any) => {
      const rubric = rubricMap[s.rubric_id];
      const maxScore = rubric?.max_score ?? 25;
      return {
        session_id: sessionId,
        rubric_id: s.rubric_id,
        score: Math.max(0, Math.min(maxScore, Math.round(s.score))),
        feedback: s.feedback || "",
      };
    });

    const totalScore = validScores.reduce((sum: number, s: any) => sum + s.score, 0);
    const maxPossible = rubrics.reduce((sum: number, r: any) => sum + r.max_score, 0);

    if (validScores.length > 0) {
      await supabase.from("practice_scores").insert(validScores);
    }

    await supabase
      .from("practice_sessions")
      .update({ submitted_at: new Date().toISOString(), total_score: totalScore, max_possible: maxPossible })
      .eq("id", sessionId);

    const xpReward = Number((session as any).practice_activities?.xp_reward ?? 0);
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
        revalidatePath("/", "layout");
        revalidatePath("/");
        revalidatePath("/practice");
        revalidatePath("/profile");
      }
    }

    const enrichedScores = validScores.map((s: any) => ({
      ...s,
      name: rubricMap[s.rubric_id]?.name ?? "",
      max_score: rubricMap[s.rubric_id]?.max_score ?? 25,
    }));

    return NextResponse.json({ scores: enrichedScores, totalScore, maxPossible, xpEarned, xpDelta });
  } catch (err: any) {
    console.error("[practice/submit]", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
