"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const REMEMBER_ME_KEY = "nudgeable_remember_me";
const SESSION_ACTIVE_KEY = "nudgeable_session_active";

export default function ProfileSignOut() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex items-center gap-2 text-sm text-muted hover:text-fuchsia transition font-medium"
    >
      <LogOut size={15} />
      Sign out
    </button>
  );
}
