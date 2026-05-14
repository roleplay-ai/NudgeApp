import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days     = Math.min(Number(searchParams.get("days") ?? "7"), 90);
    const page     = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "15"), 1), 100);
    const since    = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const offset     = (page - 1) * pageSize;

    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("analytics_logged_in_users_page", {
      p_since: since,
      p_limit: pageSize,
      p_offset: offset,
    });

    if (error) {
      console.error("[analytics/logged-in-users] rpc error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as {
      user_id: string;
      email: string;
      profile_name: string;
      event_count: number;
      last_seen_at: string;
      total_count: number;
    }[];

    const total = rows[0]?.total_count ?? 0;
    const items = rows.map(({ total_count: _t, ...rest }) => ({
      userId: rest.user_id,
      email: rest.email,
      displayName: rest.profile_name,
      eventCount: rest.event_count,
      lastSeenAt: rest.last_seen_at,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
    });
  } catch (err) {
    console.error("[analytics/logged-in-users] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
