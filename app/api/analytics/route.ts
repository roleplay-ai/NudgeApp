import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// Fills every calendar day in the window with zero so the chart has no gaps
function fillDailyGaps(
  rows: { day: string; views: number; unique_sessions: number; unique_ips: number }[],
  days: number
) {
  const map = new Map(rows.map((r) => [r.day, r]));
  const today = new Date();
  const filled = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    filled.push(
      map.get(key) ?? { day: key, views: 0, unique_sessions: 0, unique_ips: 0 }
    );
  }
  return filled;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days  = Math.min(Number(searchParams.get("days") ?? "7"), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const supabase = createServiceClient();

    // All five queries run in parallel — Postgres does the aggregation,
    // only computed numbers come back over the wire.
    const [
      kpisRes,
      dailyRes,
      breakdownRes,
      videosRes,
      newsRes,
      productsRes,
      applyRes,
      linksRes,
    ] = await Promise.all([
      supabase.rpc("analytics_kpis",            { since_ts: since }),
      supabase.rpc("analytics_daily",           { since_ts: since }),
      supabase.rpc("analytics_event_breakdown", { since_ts: since }),
      supabase.rpc("analytics_content_leaderboard", { since_ts: since, event_type: "video_click"   }),
      supabase.rpc("analytics_content_leaderboard", { since_ts: since, event_type: "news_click"    }),
      supabase.rpc("analytics_content_leaderboard", { since_ts: since, event_type: "product_click" }),
      supabase.rpc("analytics_content_leaderboard", { since_ts: since, event_type: "apply_click"   }),
      supabase.rpc("analytics_content_leaderboard", { since_ts: since, event_type: "link_click"    }),
    ]);

    // Surface the first error if any RPC failed
    const firstError = [kpisRes, dailyRes, breakdownRes, videosRes, newsRes, productsRes, applyRes, linksRes]
      .find((r) => r.error)?.error;

    if (firstError) {
      console.error("[analytics] rpc error:", firstError);
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    // analytics_kpis returns a single-row table — take the first element
    const kpisRow = Array.isArray(kpisRes.data) ? kpisRes.data[0] : kpisRes.data;
    const kpis = kpisRow as {
      pageViews: number; uniqueSessions: number; uniqueIps: number;
      loggedInUsers: number; totalEvents: number;
    };
    const dailyRaw       = (dailyRes.data ?? []) as { day: string; views: number; unique_sessions: number; unique_ips: number }[];
    const eventBreakdown = (breakdownRes.data ?? []) as { event: string; count: number }[];

    return NextResponse.json({
      kpis,
      daily: fillDailyGaps(dailyRaw, days),
      eventBreakdown,
      content: {
        videos:   videosRes.data   ?? [],
        news:     newsRes.data     ?? [],
        products: productsRes.data ?? [],
        apply:    applyRes.data    ?? [],
        links:    linksRes.data    ?? [],
      },
    });
  } catch (err) {
    console.error("[analytics] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
