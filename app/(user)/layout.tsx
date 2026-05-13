import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/user/UserNav";
import PageView from "@/components/user/PageView";
import PendingPointsAwarder from "@/components/user/PendingPointsAwarder";
import { getActiveCoupon } from "@/app/actions/getCoupon";
import { resolveDisplayName } from "@/lib/displayName";
import type { Coupon } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let masteryScore = 0;
  let streakDays = 0;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let coupon: Coupon | null = null;
  let topPercent: number | null = null;
  if (user) {
    const [profileResult, couponResult, topPercentResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("xp, streak, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      getActiveCoupon(),
      // RPC backed by migration_033_user_top_percent.sql. Returns 1..100
      // ("top X%") computed from profiles.xp across all users.
      supabase.rpc("get_user_top_percent", { p_user: user.id }),
    ]);
    if (profileResult.error) {
      console.error("[UserLayout] profile fetch failed:", profileResult.error.message);
    }
    if (topPercentResult.error) {
      console.error("[UserLayout] get_user_top_percent failed:", topPercentResult.error.message);
    }
    const r = profileResult.data as {
      xp?: number;
      streak?: number;
      display_name?: string | null;
      avatar_url?: string | null;
    } | null;
    masteryScore = Number(r?.xp ?? 0);
    streakDays = Number(r?.streak ?? 0);
    const meta = user.user_metadata ?? {};
    displayName = resolveDisplayName({
      profileDisplayName: r?.display_name,
      metaFullName: meta.full_name,
      metaName: meta.name,
    });
    avatarUrl =
      r?.avatar_url?.trim() ||
      meta.avatar_url?.trim() ||
      meta.picture?.trim() ||
      null;
    coupon = couponResult;
    const topPctRaw = topPercentResult.data;
    topPercent = typeof topPctRaw === "number" ? topPctRaw : null;
  }

  return (
    <div className="min-h-screen bg-homeCanvas">
      <UserNav
        masteryScore={masteryScore}
        streakDays={streakDays}
        displayName={displayName}
        avatarUrl={avatarUrl}
        isLoggedIn={!!user}
        coupon={coupon}
        topPercent={topPercent}
      />
      <PageView />
      {!!user && <PendingPointsAwarder />}
      <main className="sm:ml-64 pb-[calc(76px+env(safe-area-inset-bottom))] sm:pb-8 min-h-screen bg-homeCanvas">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
