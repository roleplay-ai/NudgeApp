"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = Record<string, unknown>;

type PageStat    = { page: string; views: number; unique_visitors: number };
type EventStat   = { event: string; count: number };
type ClickStat   = { title: string; event: string; count: number };
type DailyStat   = { day: string; views: number; unique_visitors: number; unique_ips: number };

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

function formatDay(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AnalyticsAdmin() {
  const supabase = createClient();

  const [range, setRange] = useState<Range>(7);
  const [pages, setPages]       = useState<PageStat[]>([]);
  const [events, setEvents]     = useState<EventStat[]>([]);
  const [clicks, setClicks]     = useState<ClickStat[]>([]);
  const [daily, setDaily]       = useState<DailyStat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]           = useState(0);
  const [uniq, setUniq]             = useState(0);
  const [uniqUsers, setUniqUsers]   = useState(0);
  const [loggedIn, setLoggedIn]     = useState(0);

  async function load(r: Range) {
    setLoading(true);

    const since = new Date(Date.now() - r * 24 * 60 * 60 * 1000).toISOString();

    // All rows in range (limit 20k to stay safe)
    const { data: rows, error } = await supabase
      .from("analytics_events")
      .select("event, page, visitor_id, ip_address, user_id, meta, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);

    if (error || !rows) {
      setLoading(false);
      return;
    }

    const all = rows as Row[];

    // ── Page views ────────────────────────────────────────────────
    const pviews = all.filter((e) => e.event === "page_view");
    setTotal(pviews.length);
    const uniqueVisitors = new Set(pviews.map((e) => e.visitor_id)).size;
    setUniq(uniqueVisitors);
    const uniqueUsers = new Set(
      pviews.map((e) => (e.ip_address ? String(e.ip_address) : "")).filter(Boolean)
    ).size;
    setUniqUsers(uniqueUsers);

    const loggedInUsers = new Set(
      all.map((e) => (e.user_id ? String(e.user_id) : "")).filter(Boolean)
    ).size;
    setLoggedIn(loggedInUsers);

    const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
    for (const row of pviews) {
      const p = String(row.page || "/");
      if (!pageMap.has(p)) pageMap.set(p, { views: 0, visitors: new Set() });
      const entry = pageMap.get(p)!;
      entry.views++;
      if (row.visitor_id) entry.visitors.add(row.visitor_id as string);
    }
    const pageStats: PageStat[] = [...pageMap.entries()]
      .map(([page, { views, visitors }]) => ({ page, views, unique_visitors: visitors.size }))
      .sort((a, b) => b.views - a.views);
    setPages(pageStats);

    // ── Event breakdown ───────────────────────────────────────────
    const evMap = new Map<string, number>();
    for (const row of all) {
      const ev = String(row.event || "other");
      evMap.set(ev, (evMap.get(ev) || 0) + 1);
    }
    const eventStats: EventStat[] = [...evMap.entries()]
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count);
    setEvents(eventStats);

    // ── Top clicked items ─────────────────────────────────────────
    const clickEvents = all.filter((e) => e.event !== "page_view");
    const clickMap = new Map<string, { event: string; count: number }>();
    for (const row of clickEvents) {
      const meta = (row.meta as Record<string, string> | null) ?? {};
      const title = meta.title || meta.url || String(row.page || "");
      const key = `${row.event}||${title}`;
      if (!clickMap.has(key)) clickMap.set(key, { event: String(row.event), count: 0 });
      clickMap.get(key)!.count++;
    }
    const clickStats: ClickStat[] = [...clickMap.entries()]
      .map(([key, { event, count }]) => ({
        title: key.split("||")[1] || "",
        event,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    setClicks(clickStats);

    // ── Daily page views + unique users ──────────────────────────
    const dailyMap = new Map<string, { views: number; visitors: Set<string>; ips: Set<string> }>();
    for (const row of pviews) {
      const day = String(row.created_at || "").slice(0, 10);
      if (!dailyMap.has(day)) dailyMap.set(day, { views: 0, visitors: new Set(), ips: new Set() });
      const entry = dailyMap.get(day)!;
      entry.views++;
      if (row.visitor_id) entry.visitors.add(row.visitor_id as string);
      if (row.ip_address) entry.ips.add(row.ip_address as string);
    }
    const days: DailyStat[] = [...dailyMap.entries()]
      .map(([day, { views, visitors, ips }]) => ({
        day,
        views,
        unique_visitors: visitors.size,
        unique_ips: ips.size,
      }))
      .sort((a, b) => a.day.localeCompare(b.day));
    setDaily(days);

    setLoading(false);
  }

  useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const eventLabel: Record<string, string> = {
    page_view:     "Page view",
    news_click:    "News click",
    video_click:   "Video click",
    product_click: "Product click",
    link_click:    "Link click",
    apply_click:   "Apply click",
    learn_click:   "Learn click",
    tool_click:    "Tool click",
  };

  const maxUniqIps = Math.max(...daily.map((d) => d.unique_ips), 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Analytics</h1>
          <p className="text-sm text-muted mt-0.5">Anonymous page views &amp; click events.</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                range === r
                  ? "bg-amber text-shadow"
                  : "bg-white border border-nborder text-muted hover:bg-chiffon"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Page views",      value: total,                                      color: "bg-nblue",    desc: "Total page view events" },
          { label: "Unique visitors", value: uniq,                                       color: "bg-emerald",  desc: "Anonymous sessions (browser)" },
          { label: "Unique users",    value: uniqUsers,                                  color: "bg-amber",    desc: "Distinct IPs seen" },
          { label: "Logged-in users", value: loggedIn,                                   color: "bg-npurple",  desc: "Authenticated accounts" },
          { label: "Events tracked",  value: events.reduce((s, e) => s + e.count, 0),   color: "bg-norange",  desc: "All event types combined" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${k.color} mb-3`} />
            <div className="text-3xl font-extrabold">
              {loading ? "—" : k.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted font-medium mt-1">{k.label}</div>
            <div className="text-[10px] text-muted/60 mt-0.5">{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Daily unique users chart */}
      {!loading && daily.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold">Daily unique users</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-amber inline-block" />
              Unique IPs per day
            </div>
          </div>
          {/* chart area — extra top padding so labels above bars don't clip */}
          <div className="flex items-end gap-1.5 pt-6" style={{ height: "120px" }}>
            {daily.map((d) => {
              const barH = Math.max(Math.round((d.unique_ips / maxUniqIps) * 72), 2);
              return (
                <div key={d.day} className="relative flex flex-col items-center flex-1 min-w-0" style={{ height: "100%" }}>
                  {/* count label above bar */}
                  <span
                    className="absolute text-[9px] font-bold text-shadow leading-none"
                    style={{ bottom: `${barH + 18}px` }}
                  >
                    {d.unique_ips > 0 ? d.unique_ips : ""}
                  </span>
                  {/* bar */}
                  <div className="w-full mt-auto flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-amber opacity-80 transition-all"
                      style={{ height: `${barH}px` }}
                      title={`${d.unique_ips} unique users`}
                    />
                    <span className="text-[9px] text-muted truncate w-full text-center">
                      {formatDay(d.day)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top pages */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold mb-4">Top pages</div>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : pages.length === 0 ? (
            <p className="text-sm text-muted">No data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted border-b border-nborder">
                  <th className="text-left pb-2 font-semibold">Page</th>
                  <th className="text-right pb-2 font-semibold">Views</th>
                  <th className="text-right pb-2 font-semibold">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nborder">
                {pages.slice(0, 10).map((p) => (
                  <tr key={p.page}>
                    <td className="py-2 font-mono text-xs text-shadow truncate max-w-[140px]">
                      {p.page}
                    </td>
                    <td className="py-2 text-right font-semibold">{p.views.toLocaleString()}</td>
                    <td className="py-2 text-right text-muted">{p.unique_visitors.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Event breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold mb-4">Events breakdown</div>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted">No data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted border-b border-nborder">
                  <th className="text-left pb-2 font-semibold">Event</th>
                  <th className="text-right pb-2 font-semibold">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nborder">
                {events.map((e) => (
                  <tr key={e.event}>
                    <td className="py-2 text-shadow font-medium">
                      {eventLabel[e.event] ?? e.event}
                    </td>
                    <td className="py-2 text-right font-semibold">{e.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top clicks */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="text-sm font-bold mb-4">Top clicked items</div>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : clicks.length === 0 ? (
          <p className="text-sm text-muted">No click events yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted border-b border-nborder">
                <th className="text-left pb-2 font-semibold">Item</th>
                <th className="text-left pb-2 font-semibold">Type</th>
                <th className="text-right pb-2 font-semibold">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nborder">
              {clicks.map((c, i) => (
                <tr key={i}>
                  <td className="py-2 text-shadow line-clamp-1 max-w-[260px]">{c.title}</td>
                  <td className="py-2 text-muted text-xs font-mono">
                    {eventLabel[c.event] ?? c.event}
                  </td>
                  <td className="py-2 text-right font-semibold">{c.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
