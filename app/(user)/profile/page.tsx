import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAdmin = user
    ? (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role === "admin"
    : false;

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[2px] text-norange">PROFILE</div>
      <h1 className="text-2xl font-extrabold text-shadow mb-5">Your account</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-5">
        <p className="text-sm text-muted">You're browsing as a guest. All content is freely available — no account needed.</p>
      </div>

      {isAdmin && (
        <Link href="/admin" className="block bg-amber rounded-2xl p-4 mb-3 hover:opacity-90">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-shadow" />
            <div className="flex-1">
              <div className="text-sm font-bold text-shadow">Admin panel</div>
              <div className="text-xs text-shadow/70">Manage all content</div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
