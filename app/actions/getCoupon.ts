"use server";

import { createClient } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/types";

/**
 * Returns the most recent active coupon whose validity window contains now(),
 * or null if no such coupon exists.
 *
 * RLS on the coupons table already enforces that only authenticated users can
 * see valid rows — unauthenticated callers get an empty result, not an error.
 */
export async function getActiveCoupon(): Promise<Coupon | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .lte("valid_from", new Date().toISOString())
    .or("valid_until.is.null,valid_until.gte." + new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[getActiveCoupon] error:", error.message);
    }
    return null;
  }

  return data as Coupon | null;
}
