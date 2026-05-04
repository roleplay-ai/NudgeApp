"use client";
import InstallAppSection from "@/components/user/InstallAppSection";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Briefcase, Wrench, Newspaper, UserCircle } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/apply", label: "Apply", icon: Briefcase },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/today", label: "Today", icon: Newspaper },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function UserNav() {
  const path = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-nborder fixed inset-y-0 left-0 px-4 py-6">
        <div className="mb-8 px-2">
          <div className="text-[10px] font-bold tracking-[2px] text-norange">NUDGEABLE.AI</div>
          <div className="text-lg font-extrabold text-shadow">AI Fluency</div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {items.map((it) => {
            const Ic = it.icon;
            const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
            return (
              <Link key={it.href} href={it.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition
                  ${active ? "bg-shadow text-amber" : "text-shadow hover:bg-chiffon"}`}>
                <Ic size={18} /> {it.label}
              </Link>
            );
          })}
        </nav>
        <InstallAppSection variant="compact" />
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-nborder
        flex justify-around py-2 px-1 pb-4 z-30">
        {items.map((it) => {
          const Ic = it.icon;
          const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
          return (
            <Link key={it.href} href={it.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 ${active ? "text-shadow" : "text-muted"}`}>
              <div className={`px-3 py-1 rounded-lg ${active ? "bg-amber" : ""}`}>
                <Ic size={18} />
              </div>
              <span className="text-[10px] font-semibold">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
