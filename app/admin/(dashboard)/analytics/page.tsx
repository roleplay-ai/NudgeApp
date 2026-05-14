"use client";

import { useEffect, useState } from "react";

type DailyStat  = { day: string; views: number; unique_sessions: number; unique_ips: number };
type EventStat  = { event: string; count: number };
type ContentItem = { item_id: string | null; title: string; url?: string; creator?: string; count: number };

type AnalyticsData = {
  kpis: {
    pageViews: number;
    uniqueSessions: number;
    uniqueIps: number;
    loggedInUsers: number;
    totalEvents: number;
  };
  daily: DailyStat[];
  eventBreakdown: EventStat[];
  content: {
    videos: ContentItem[];
    news: ContentItem[];
    products: ContentItem[];
    apply: ContentItem[];
    links: ContentItem[];
  };
};

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

type ContentTab = "videos" | "news" | "products" | "apply" | "links";

const CONTENT_TABS: { key: ContentTab; label: string; icon: string; eventKey: string }[] = [
  { key: "videos",   label: "Videos",   icon: "▶",  eventKey: "video_click"   },
  { key: "news",     label: "News",     icon: "📰", eventKey: "news_click"    },
  { key: "products", label: "Products", icon: "📦", eventKey: "product_click" },
  { key: "apply",    label: "Apply",    icon: "🎯", eventKey: "apply_click"   },
  { key: "links",    label: "Links",    icon: "🔗", eventKey: "link_click"    },
];

const EVENT_LABEL: Record<string, string> = {
  news_click:    "News",
  video_click:   "Video",
  product_click: "Product",
  link_click:    "Link",
  apply_click:   "Apply",
  learn_click:   "Learn",
  tool_click:    "Tool",
};

const EVENT_COLOR: Record<string, string> = {
  video_click:   "bg-nblue",
  news_click:    "bg-emerald",
  product_click: "bg-npurple",
  apply_click:   "bg-norange",
  link_click:    "bg-amber",
  learn_click:   "bg-nblue",
  tool_click:    "bg-npurple",
};

function formatDay(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

function ContentLeaderboard({
  items,
  loading,
  showCreator = false,
  showUrl = false,
  emptyMsg = "No data yet.",
}: {
  items: ContentItem[];
  loading: boolean;
  showCreator?: boolean;
  showUrl?: boolean;
  emptyMsg?: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
      </div>
    );
  }
  if (!items.length) {
    return <p className="text-sm text-muted py-6 text-center">{emptyMsg}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const pct = Math.round((item.count / max) * 100);
        return (
          <div key={item.item_id ?? `${i}-${item.title}`} className="group">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-xs text-muted tabular-nums w-5 shrink-0 pt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-shadow truncate" title={item.title}>
                    {item.title || <span className="italic text-muted">Untitled</span>}
                  </div>
                  {showCreator && item.creator && (
                    <div className="text-[11px] text-muted mt-0.5">by {item.creator}</div>
                  )}
                  {showUrl && item.url && (
                    <div className="text-[11px] text-muted truncate mt-0.5" title={item.url}>
                      {item.url}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold tabular-nums shrink-0">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-7">
              <div
                className="h-full bg-amber rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsAdmin() {
  const [range, setRange]         = useState<Range>(7);
  const [data, setData]           = useState<AnalyticsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>("videos");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics?days=${range}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json as AnalyticsData);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [range]);

  const kpis  = data?.kpis;
  const daily = data?.daily ?? [];
  const maxIps = Math.max(...daily.map((d) => d.unique_ips), 1);

  const clickBreakdown = (data?.eventBreakdown ?? []).filter((e) => e.event !== "page_view");
  const totalClicks    = clickBreakdown.reduce((s, e) => s + e.count, 0);

  // Count for each content tab badge
  const tabCounts: Record<ContentTab, number> = {
    videos:   data?.content.videos.reduce((s, i) => s + i.count, 0) ?? 0,
    news:     data?.content.news.reduce((s, i) => s + i.count, 0) ?? 0,
    products: data?.content.products.reduce((s, i) => s + i.count, 0) ?? 0,
    apply:    data?.content.apply.reduce((s, i) => s + i.count, 0) ?? 0,
    links:    data?.content.links.reduce((s, i) => s + i.count, 0) ?? 0,
  };

  const activeItems = data?.content[activeTab] ?? [];

  const kpiCards = [
    { label: "Unique Sessions",  value: kpis?.uniqueSessions,  desc: "Distinct browser sessions",    color: "bg-emerald" },
    { label: "Unique IPs",       value: kpis?.uniqueIps,       desc: "Distinct IP addresses",        color: "bg-amber"   },
    { label: "Logged-in Users",  value: kpis?.loggedInUsers,   desc: "Authenticated accounts",       color: "bg-npurple" },
    { label: "Total Clicks",     value: totalClicks,           desc: "All click events combined",    color: "bg-norange" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Analytics</h1>
          <p className="text-sm text-muted mt-0.5">User engagement — last {range} days</p>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          Failed to load analytics: {error}
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${k.color} mb-3`} />
            {loading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-3xl font-extrabold">{k.value?.toLocaleString() ?? "—"}</div>
            )}
            <div className="text-xs font-semibold text-shadow mt-1">{k.label}</div>
            <div className="text-[10px] text-muted/70 mt-0.5 leading-tight">{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Daily unique visitors chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="font-bold text-sm">Daily Unique Visitors</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber/80 inline-block" />
            Unique IPs per day
          </div>
        </div>

        {loading ? (
          <div className="flex items-end gap-1.5 h-28">
            {Array.from({ length: range }).map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${30 + Math.random() * 50}%` } as React.CSSProperties} />
            ))}
          </div>
        ) : daily.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No data for this period.</p>
        ) : (
          <div className="flex items-end gap-1.5 pt-8" style={{ height: "140px" }}>
            {daily.map((d) => {
              const barH = Math.max(Math.round((d.unique_ips / maxIps) * 88), 2);
              return (
                <div
                  key={d.day}
                  className="relative flex-1 flex flex-col items-center justify-end group"
                  style={{ height: "100%" }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-shadow text-white text-[9px] rounded px-1.5 py-0.5 whitespace-nowrap">
                      {formatDay(d.day)}: {d.unique_ips} IPs
                    </div>
                  </div>
                  <div className="w-full rounded-t-sm bg-amber/80 transition-all" style={{ height: `${barH}px` }} />
                  <span className="text-[8px] text-muted mt-1 truncate w-full text-center">
                    {formatDay(d.day)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Content engagement — tabbed leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-sm">Content Engagement</div>
              <div className="text-[11px] text-muted mt-0.5">Exactly what users are watching &amp; clicking</div>
            </div>
            {!loading && (
              <div className="text-xs text-muted">{totalClicks.toLocaleString()} total clicks</div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-nborder overflow-x-auto">
            {CONTENT_TABS.map((tab) => {
              const count = tabCounts[tab.key];
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-amber text-shadow"
                      : "border-transparent text-muted hover:text-shadow"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {!loading && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-amber/20 text-shadow" : "bg-gray-100 text-muted"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          <ContentLeaderboard
            items={activeItems}
            loading={loading}
            showCreator={activeTab === "videos"}
            showUrl={activeTab === "links" || activeTab === "news"}
            emptyMsg={`No ${CONTENT_TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} clicks in this period.`}
          />
        </div>
      </div>

      {/* Event breakdown + top items side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event type breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-sm">Clicks by Type</div>
            {!loading && (
              <div className="text-xs text-muted">{totalClicks.toLocaleString()} total</div>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : !clickBreakdown.length ? (
            <p className="text-sm text-muted">No click events yet.</p>
          ) : (
            <div className="space-y-3">
              {clickBreakdown.map((e) => {
                const pct = totalClicks > 0 ? Math.round((e.count / totalClicks) * 100) : 0;
                const color = EVENT_COLOR[e.event] ?? "bg-gray-300";
                return (
                  <div key={e.event}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="font-medium text-shadow">
                          {EVENT_LABEL[e.event] ?? e.event}
                        </span>
                      </div>
                      <span className="font-bold tabular-nums">
                        {e.count.toLocaleString()}
                        <span className="text-muted font-normal ml-1 text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} opacity-70 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All-time top content across all types */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="font-bold text-sm mb-4">Top Content Overall</div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : (() => {
            // Merge all content types into one ranked list
            const all = [
              ...(data?.content.videos   ?? []).map((i) => ({ ...i, type: "video_click"   })),
              ...(data?.content.news     ?? []).map((i) => ({ ...i, type: "news_click"    })),
              ...(data?.content.products ?? []).map((i) => ({ ...i, type: "product_click" })),
              ...(data?.content.apply    ?? []).map((i) => ({ ...i, type: "apply_click"   })),
              ...(data?.content.links    ?? []).map((i) => ({ ...i, type: "link_click"    })),
            ].sort((a, b) => b.count - a.count).slice(0, 10);

            const maxCount = Math.max(...all.map((i) => i.count), 1);

            if (!all.length) return <p className="text-sm text-muted">No click events yet.</p>;

            return (
              <div className="space-y-2">
                {all.map((item, i) => {
                  const pct = Math.round((item.count / maxCount) * 100);
                  const color = EVENT_COLOR[item.type] ?? "bg-gray-300";
                  return (
                    <div key={`${item.type}-${item.item_id ?? i}`}>
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs text-muted tabular-nums w-5 shrink-0 pt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
                            <span className="text-xs font-medium text-shadow truncate" title={item.title}>
                              {item.title || <span className="italic text-muted">Untitled</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 ml-3">
                            <span className="text-[10px] text-muted">{EVENT_LABEL[item.type] ?? item.type}</span>
                            {item.creator && (
                              <span className="text-[10px] text-muted">· {item.creator}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold tabular-nums shrink-0">{item.count}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-7">
                        <div className={`h-full ${color} opacity-60 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
