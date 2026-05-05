/**
 * Lightweight, fire-and-forget analytics helper.
 * Works for anonymous (unauthenticated) visitors using Supabase's anon key.
 * A random UUID is stored in sessionStorage so sessions are distinguishable
 * (it resets on every new browser session — no cross-session tracking).
 */

import { createClient } from "@/lib/supabase/client";

const VISITOR_KEY = "nv_id";

function getVisitorId(): string {
  if (typeof sessionStorage === "undefined") return crypto.randomUUID();
  let id = sessionStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    try {
      sessionStorage.setItem(VISITOR_KEY, id);
    } catch {
      // storage blocked (incognito etc.) — use ephemeral id
    }
  }
  return id;
}

export type TrackEvent =
  | "page_view"
  | "news_click"
  | "video_click"
  | "product_click"
  | "link_click"
  | "apply_click"
  | "learn_click"
  | "tool_click";

export function track(
  event: TrackEvent,
  meta?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return; // never on the server

  const payload = {
    event,
    page: window.location.pathname,
    ref: document.referrer || null,
    visitor_id: getVisitorId(),
    meta: meta ? (meta as Record<string, unknown>) : null,
  };

  const supabase = createClient();
  // Fire-and-forget — ignore errors so tracking never breaks the UI
  supabase.from("analytics_events").insert(payload).then(() => {});
}
