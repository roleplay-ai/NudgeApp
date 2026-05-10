import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/user/UserNav";
import PageView from "@/components/user/PageView";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let masteryScore = 0;
  let streakDays = 0;
  if (user) {
    const { data: row } = await supabase
      .from("profiles")
      .select("xp, streak")
      .eq("id", user.id)
      .maybeSingle();
    const r = row as { xp?: number; streak?: number } | null;
    masteryScore = Number(r?.xp ?? 0);
    streakDays = Number(r?.streak ?? 0);
  }

  return (
    <div className="min-h-screen bg-homeCanvas">
      <UserNav masteryScore={masteryScore} streakDays={streakDays} isLoggedIn={!!user} />
      <PageView />
      <main className="sm:ml-64 pt-[calc(72px+env(safe-area-inset-top))] pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:pt-0 sm:pb-8 min-h-screen bg-homeCanvas">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
