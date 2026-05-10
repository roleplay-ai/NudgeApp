"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Crosshair,
  GraduationCap,
  Home,
  Lightbulb,
  LogIn,
  LogOut,
  UserRound,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GuestAccountSidebarCard } from "@/components/user/GuestAccountPromo";
import { useEffect } from "react";

const REMEMBER_ME_KEY = "nudgeable_remember_me";
const SESSION_ACTIVE_KEY = "nudgeable_session_active";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/apply", label: "Apply", icon: Crosshair },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

export default function UserNav({
  masteryScore: _masteryScore = 0,
  streakDays: _streakDays = 0,
  isLoggedIn = false,
}: {
  masteryScore?: number;
  streakDays?: number;
  isLoggedIn?: boolean;
}) {
  const path = usePathname();
  const router = useRouter();

  // "Remember me = false" enforcement:
  // If the user didn't check "remember me", we sign them out when the browser
  // is reopened (sessionStorage is cleared on browser close).
  useEffect(() => {
    if (!isLoggedIn) return;

    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
    const sessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);

    if (rememberMe === "false" && !sessionActive) {
      // Browser was reopened without "remember me" — end the session
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        router.refresh();
      });
    }
  }, [isLoggedIn, router]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-user-sidebar
        className="hidden sm:flex flex-col w-64 min-w-64 min-h-0 overflow-y-auto border-r border-homeInk/20 fixed inset-y-0 left-0 z-50 px-4 py-6 bg-homeSidebar text-homeCanvas/95"
      >
        <div className="mb-7 px-1">
          <div className="text-[10px] font-bold tracking-[2px] text-homeClay">NUDGEABLE.AI</div>
          <div className="text-xl font-extrabold tracking-tight text-white">AI Fluency</div>
        </div>

        <nav className="flex flex-col gap-1 flex-1 min-h-0">
          {items.map((it) => {
            const Ic = it.icon;
            const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition border no-underline
                  ${active
                    ? "bg-homeClay/15 border-homeClay/70 text-homeCanvas shadow-[0_0_0_1px_rgba(192,123,58,0.35)]"
                    : "border-transparent text-homeNavMuted hover:bg-white/[0.06] hover:text-homeCanvas"
                  }`}
              >
                <Ic
                  size={18}
                  strokeWidth={2}
                  className={`shrink-0 ${active ? "text-homeClay" : "text-homeNavMuted"}`}
                />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-homeInk/35 space-y-3">
          {!isLoggedIn ? <GuestAccountSidebarCard /> : null}

          <div className="space-y-1">
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition border no-underline
                  ${path === "/profile"
                    ? "bg-homeClay/15 border-homeClay/70 text-homeCanvas"
                    : "border-transparent text-homeNavMuted hover:bg-white/[0.06] hover:text-homeCanvas"
                  }`}
              >
                <UserRound size={18} strokeWidth={2} className="shrink-0 text-homeNavMuted" />
                <span className="truncate">Profile</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition border border-transparent text-homeNavMuted hover:bg-white/[0.06] hover:text-homeCanvas w-full text-left"
              >
                <LogOut size={18} strokeWidth={2} className="shrink-0 text-homeNavMuted" />
                <span className="truncate">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition border border-transparent text-homeNavMuted hover:bg-white/[0.06] hover:text-homeCanvas no-underline"
              >
                <LogIn size={18} strokeWidth={2} className="shrink-0 text-homeNavMuted" />
                <span className="truncate">Sign in</span>
              </Link>
            </>
          )}
          </div>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="sm:hidden fixed top-0 left-0 right-0 z-50">
        <nav
          aria-label="Primary"
          className="bg-homeSidebar border-b border-homeInk/30 pt-[max(env(safe-area-inset-top),0.5rem)] px-2 pb-2 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        >
          <div className="grid grid-cols-5 gap-1">
            {items.map((it) => {
              const Ic = it.icon;
              const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2.5 transition-[transform,background-color,color,border-color] duration-150 no-underline min-w-0 transform hover:scale-[1.06] active:scale-[0.98]
                    ${active
                      ? "bg-homeClay/25 border-homeClay text-white"
                      : "border-homeInk/20 text-homeCanvas/90 hover:bg-white/[0.06] hover:text-white"
                    }`}
                >
                  <Ic size={18} strokeWidth={2.2} className={active ? "text-amber" : "text-homeCanvas/85"} />
                  <span className="text-[11px] font-bold leading-tight w-full text-center">
                    {it.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
    </>
  );
}
