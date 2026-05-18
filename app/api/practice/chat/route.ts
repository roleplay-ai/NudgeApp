import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, activityId, message, guestMessages } = body;
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const systemPrompt = `You are a general-purpose assistant. Every user message is a request for output — execute it and deliver the result (a draft, sentence, list, rewrite, answer, etc.).

Never describe yourself, your role, your capabilities, your limitations, your policies, or how this chat works. Never open with phrases like "I'm here to…" or explain what you will or won't do. If a message could be about you or about work content, always assume they want the work content.

Do not mention practice activities, assignments, rubrics, assessments, or coaching. Do not comment on prompt quality. Be direct and concise. Refuse only clearly illegal, harmful, or unethical requests.`;

    // ── GUEST MODE ── (no DB session, conversation carried from client)
    if (!user) {
      const history: { role: "user" | "assistant"; content: string }[] = [
        ...(guestMessages || []),
        { role: "user", content: message },
      ];

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: history,
      });

      const assistantText = response.content[0].type === "text" ? response.content[0].text : "";
      return NextResponse.json({ reply: assistantText, guest: true });
    }

    // ── AUTHENTICATED MODE ── (DB-backed session)
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

    // Save user message
    await supabase.from("practice_messages").insert({
      session_id: currentSessionId,
      role: "user",
      content: message,
    });

    const history = (prevMessages || []).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    history.push({ role: "user", content: message });

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
