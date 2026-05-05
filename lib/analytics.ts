/**
 * Lightweight, fire-and-forget analytics helper.
 * Works for anonymous (unauthenticated) visitors using Supabase's anon key.
 * A random UUID is stored in sessionStorage so sessions are distinguishable
 * (it resets on every new browser session — no cross-session tracking).
 */

import { createClient } from "@/lib/supabase/client";

const VISITOR_KEY = "nv_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older mobile browsers / non-secure contexts
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r =
      typeof crypto !== "undefined" && crypto.getRandomValues
        ? (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === "x" ? 0 : 1)
        : (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getVisitorId(): string {
  if (typeof sessionStorage === "undefined") return generateUUID();
  let id = sessionStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateUUID();
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
