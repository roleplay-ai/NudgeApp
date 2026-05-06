import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function pickIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  return realIp || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ip_address = pickIp(req.headers);

    const supabase = await createClient();
    const { error } = await supabase.from("analytics_events").insert({
      ...body,
      ip_address,
    });

    if (error) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

