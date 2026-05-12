import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/user/UserNav";
import PageView from "@/components/user/PageView";
import { getActiveCoupon } from "@/app/actions/getCoupon";
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
  let coupon: Coupon | null = null;
  let isEarlyPhase = false;
  if (user) {
    const [profileResult, couponResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("xp, streak, display_name")
        .eq("id", user.id)
        .maybeSingle(),
      getActiveCoupon(),
    ]);
    if (profileResult.error) {
      console.error("[UserLayout] profile fetch failed:", profileResult.error.message);
    }
    const r = profileResult.data as {
      xp?: number;
      streak?: number;
      display_name?: string | null;
    } | null;
    masteryScore = Number(r?.xp ?? 0);
    streakDays = Number(r?.streak ?? 0);
    const meta = user.user_metadata ?? {};
    displayName =
      r?.display_name?.trim() ||
      meta.full_name?.trim() ||
      meta.name?.trim() ||
      null;
    coupon = couponResult;
    isEarlyPhase =
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) < 8;
  }

  return (
    <div className="min-h-screen bg-homeCanvas">
      <UserNav
        masteryScore={masteryScore}
        streakDays={streakDays}
        displayName={displayName}
        isLoggedIn={!!user}
        coupon={coupon}
        isEarlyPhase={isEarlyPhase}
      />
      <PageView />
      <main className="sm:ml-64 pb-[calc(76px+env(safe-area-inset-bottom))] sm:pb-8 min-h-screen bg-homeCanvas">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
