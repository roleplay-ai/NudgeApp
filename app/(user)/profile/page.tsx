import { createClient } from "@/lib/supabase/server";
// import InstallAppSection from "@/components/user/InstallAppSection";
import Link from "next/link";
import { ShieldCheck, UserRound, LogIn } from "lucide-react";
import ProfileSignOut from "@/components/user/ProfileSignOut";

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
      <p className="text-sm text-muted mb-6 max-w-xl">Manage your account and access your learning progress.</p>

      <div className="bg-white rounded-2xl p-6 border border-nborder shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-chiffon border border-nborder flex items-center justify-center shrink-0">
            <UserRound className="text-shadow" size={28} />
          </div>
          <div className="flex-1 min-w-0">
            {user ? (
              <>
                <div className="font-semibold text-shadow text-sm truncate">{user.email}</div>
                <div className="text-xs text-muted mt-0.5">Signed in · progress saving enabled</div>
              </>
            ) : (
              <>
                <div className="font-semibold text-shadow text-sm">Guest</div>
                <div className="text-xs text-muted mt-0.5">
                  All content is available — sign in to save progress
                </div>
              </>
            )}
          </div>
        </div>

        {user ? (
          <div className="mt-4 pt-4 border-t border-nborder">
            <ProfileSignOut />
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-nborder flex flex-col sm:flex-row gap-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-shadow text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition no-underline"
            >
              <LogIn size={15} />
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 border border-nborder text-shadow text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-chiffon transition no-underline"
            >
              Create account
            </Link>
          </div>
        )}
      </div>

      {isAdmin && (
        <Link
          href="/admin"
          className="block bg-shadow rounded-2xl p-4 border border-white/10 hover:opacity-95 transition shadow-md mb-4"
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

      {/* <div className="mt-8">
        <InstallAppSection variant="full" />
      </div> */}
    </div>
  );
}
