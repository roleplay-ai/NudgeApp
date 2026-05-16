import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get session + activity
    const { data: session } = await supabase
      .from("practice_sessions")
      .select("*, practice_activities(name, description, assessment_prompt, xp_reward)")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    // Get rubrics
    const { data: rubrics } = await supabase
      .from("practice_rubrics")
      .select("*")
      .eq("activity_id", session.activity_id)
      .order("created_at");

    if (!rubrics || rubrics.length === 0) {
      return NextResponse.json({ error: "No rubrics defined for this activity" }, { status: 400 });
    }

    // Get all messages
    const { data: messages } = await supabase
      .from("practice_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at");

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages to assess" }, { status: 400 });
    }

    // Build conversation transcript
    const transcript = messages
      .map((m: any) => `${m.role === "user" ? "USER" : "AI COACH"}: ${m.content}`)
      .join("\n\n");

    const rubricList = rubrics
      .map((r: any) => `- ${r.name} (max ${r.max_score} pts): ${r.description || ""}`)
      .join("\n");

    const activity = (session as any).practice_activities;
    const assessmentSystemPrompt = activity?.assessment_prompt || `You are an expert prompt engineering assessor. Review the conversation and score the user's prompts.

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

    const userContent = `Activity: ${activity?.name || "Prompt Engineering Practice"}
Brief: ${activity?.description || ""}

Rubric criteria:
${rubricList}

Rubric IDs for reference:
${rubrics.map((r: any) => `- ${r.name}: ${r.id}`).join("\n")}

Conversation transcript:
${transcript}

Score each rubric criterion based on the user's prompts. Return JSON only.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: assessmentSystemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";

    // Parse JSON response
    let parsed: { scores: { rubric_id: string; score: number; feedback: string }[] };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return NextResponse.json({ error: "Failed to parse assessment response" }, { status: 500 });
    }

    // Validate and clamp scores against rubric max
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

    // Save scores
    if (validScores.length > 0) {
      await supabase.from("practice_scores").insert(validScores);
    }

    // Mark session as submitted
    await supabase
      .from("practice_sessions")
      .update({ submitted_at: new Date().toISOString(), total_score: totalScore, max_possible: maxPossible })
      .eq("id", sessionId);

    // Award XP proportional to score (mirrors quiz pattern: delta applied so re-attempts update correctly)
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

    // Return enriched scores with rubric names
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
