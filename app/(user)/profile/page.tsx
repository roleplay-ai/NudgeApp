import { createClient } from "@/lib/supabase/server";
import InstallAppSection from "@/components/user/InstallAppSection";
import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user
    ? (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role === "admin"
    : false;

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">PROFILE</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-shadow mb-2 tracking-tight">Your account</h1>
      <p className="text-sm text-muted mb-6 max-w-xl">Manage access and admin tools when you&apos;re signed in.</p>

      <div className="bg-white rounded-2xl p-6 border border-nborder shadow-sm text-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-chiffon border border-nborder flex items-center justify-center mx-auto mb-3">
          <UserRound className="text-shadow" size={28} />
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
          {user
            ? "You're signed in. Progress and streaks show in the sidebar."
            : "You're browsing as a guest. All learning content is available — create an account later to save progress."}
        </p>
      </div>

      {isAdmin && (
        <Link
          href="/admin"
          className="block bg-shadow rounded-2xl p-4 border border-white/10 hover:opacity-95 transition shadow-md"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <ShieldCheck size={22} className="text-amber" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold">Admin panel</div>
              <div className="text-xs text-white/70">Manage content, tools, news, and more</div>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-8">
        <InstallAppSection variant="full" />
      </div>
    </div>
  );
}
