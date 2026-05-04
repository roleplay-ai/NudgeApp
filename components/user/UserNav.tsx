"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  // Flame, // future: streak row in sidebar footer
  GraduationCap,
  Home,
  Library,
  // LogIn, // future: sidebar login link
  // LogOut, // sidebar sign out (commented out)
  // UserRound, // future: profile link
  Wrench,
} from "lucide-react";
// import { createClient } from "@/lib/supabase/client"; // with sidebar sign out
// import { masteryFromScore } from "@/lib/masteryUi"; // future: mastery card in sidebar

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/apply", label: "Apply", icon: Crosshair },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/library", label: "Library", icon: Library },
];

export default function UserNav({
  masteryScore: _masteryScore = 0,
  streakDays: _streakDays = 0,
  isLoggedIn: _isLoggedIn = false,
}: {
  /** Reserved for future sidebar mastery widget */
  masteryScore?: number;
  /** Reserved for future sidebar streak row */
  streakDays?: number;
  isLoggedIn?: boolean;
}) {
  const path = usePathname();
  // const { displayScore, subline, barPct } = masteryFromScore(masteryScore); // future: mastery card

  // async function signOut() {
  //   const supabase = createClient();
  //   await supabase.auth.signOut();
  //   router.refresh();
  //   router.push("/");
  // }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-user-sidebar
        className="hidden sm:flex flex-col w-64 min-w-64 min-h-0 overflow-y-auto border-r border-white/10 fixed inset-y-0 left-0 z-50 px-4 py-6 text-[#ececec]"
        style={{ backgroundColor: "#121212", color: "#ececec" }}
      >
        <div className="mb-7 px-1">
          <div className="text-[10px] font-bold tracking-[2px] text-norange">NUDGEABLE.AI</div>
          <div className="text-xl font-extrabold tracking-tight text-[#ffffff]">AI Fluency</div>
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
                  ${
                    active
                      ? "bg-white/[0.07] border-amber text-[#FFCE00] shadow-[0_0_0_1px_rgba(255,206,0,0.25)]"
                      : "border-transparent text-[#e4e4e4] hover:bg-white/[0.06] hover:text-[#ffffff]"
                  }`}
                style={{ color: active ? "#FFCE00" : "#e4e4e4" }}
              >
                <Ic size={18} strokeWidth={2} className="shrink-0" style={{ color: active ? "#FFCE00" : "#cfcfcf" }} />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-4 border-t border-white/10">
          {/*
            FUTURE: sidebar footer — restore imports (Flame, LogIn, UserRound, masteryFromScore),
            uncomment masteryFromScore(...) above, rename props from _masteryScore/_streakDays, then paste back:
            — Mastery card (displayScore, barPct, subline)
            — Streak row (Flame + streakDays)
            — Profile Link + branch: Sign out when isLoggedIn else Log in
            (Keep Sign out below live when re-enabling the full block, or fold it into that branch.)
          */}

          {/* {isLoggedIn ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] font-semibold text-[#e0e0e0] hover:text-[#ffffff] hover:bg-white/[0.04] w-full text-left"
              style={{ color: "#e0e0e0" }}
            >
              <LogOut size={17} className="shrink-0" style={{ color: "#bdbdbd" }} />
              Sign out
            </button>
          ) : null} */}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 flex justify-around py-2 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50"
        style={{ backgroundColor: "#121212", color: "#e8e8e8" }}
      >
        {items.map((it) => {
          const Ic = it.icon;
          const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex flex-col items-center gap-0.5 px-1 py-0.5 min-w-0 flex-1 max-w-[4.5rem] no-underline"
              style={{ color: active ? "#FFCE00" : "#c8c8c8" }}
            >
              <div
                className={`px-2 py-1 rounded-lg border ${active ? "bg-white/[0.08] border-amber" : "border-transparent"}`}
              >
                <Ic size={17} strokeWidth={2} style={{ color: active ? "#FFCE00" : "#c8c8c8" }} />
              </div>
              <span className="text-[8.5px] font-semibold truncate w-full text-center leading-tight">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
