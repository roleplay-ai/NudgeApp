import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { sessionId, activityId, message } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({ user_id: user.id, activity_id: activityId })
        .select("id")
        .single();
      if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 });
      currentSessionId = session.id;
    }

    // Fetch previous messages for context
    const { data: prevMessages } = await supabase
      .from("practice_messages")
      .select("role, content")
      .eq("session_id", currentSessionId)
      .order("created_at");

    // Fetch activity for context
    const { data: activity } = await supabase
      .from("practice_activities")
      .select("name, description")
      .eq("id", activityId)
      .single();

    // Save user message
    await supabase.from("practice_messages").insert({
      session_id: currentSessionId,
      role: "user",
      content: message,
    });

    // Build messages for Anthropic
    const history = (prevMessages || []).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    history.push({ role: "user", content: message });

    const systemPrompt = activity
      ? `You are an AI assistant. The user is working on the following task:\n\n${activity.description || ""}\n\nRespond directly and helpfully to whatever the user asks. Do not give feedback on their prompts, do not coach them, and do not comment on prompt quality. Simply produce the best possible output for their request.`
      : "You are a helpful AI assistant. Respond directly to whatever the user asks.";

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });

    const assistantText = response.content[0].type === "text" ? response.content[0].text : "";

    // Save assistant message
    await supabase.from("practice_messages").insert({
      session_id: currentSessionId,
      role: "assistant",
      content: assistantText,
    });

    // Update message count
    await supabase
      .from("practice_sessions")
      .update({ messages_count: (prevMessages?.length ?? 0) + 2 })
      .eq("id", currentSessionId);

    return NextResponse.json({ reply: assistantText, sessionId: currentSessionId });
  } catch (err: any) {
    console.error("[practice/chat]", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
