import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/user/UserNav";
import PageView from "@/components/user/PageView";
import { getActiveCoupon } from "@/app/actions/getCoupon";
import type { Coupon } from "@/lib/types";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let masteryScore = 0;
  let streakDays = 0;
  let coupon: Coupon | null = null;
  let isEarlyPhase = false;
  if (user) {
    const [profileResult, couponResult] = await Promise.all([
      supabase.from("profiles").select("xp, streak").eq("id", user.id).maybeSingle(),
      getActiveCoupon(),
    ]);
    const r = profileResult.data as { xp?: number; streak?: number } | null;
    masteryScore = Number(r?.xp ?? 0);
    streakDays = Number(r?.streak ?? 0);
    coupon = couponResult;
    isEarlyPhase = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) < 8;
  }

  return (
    <div className="min-h-screen bg-homeCanvas">
      <UserNav
        masteryScore={masteryScore}
        streakDays={streakDays}
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
