import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { SITE_BRAND_MARK } from "@/lib/site";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, username")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-shadow">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extrabold mb-3 text-white">Admin only</h1>
          <p className="text-white/60 text-sm mb-6">
            Your account doesn't have admin access. Ask the owner to set your role to{" "}
            <code className="bg-white/10 px-1 rounded text-amber">admin</code> in Supabase.
          </p>
          <Link href="/" className="inline-block bg-amber text-shadow font-bold px-5 py-2.5 rounded-full">
            Go to app
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || user.email;

  const sections = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/trending", label: "Trending" },
    { href: "/admin/video-of-week", label: "Video of the week" },
    { href: "/admin/product-of-day", label: "Product of day" },
    { href: "/admin/news", label: "News" },
    { href: "/admin/videos", label: "Videos" },
    { href: "/admin/tools", label: "Tools" },
    { href: "/admin/glossary", label: "Glossary" },
    { href: "/admin/resources", label: "Resources" },
    { href: "/admin/worlds", label: "Worlds & Modules" },
    { href: "/admin/quizzes", label: "Quizzes" },
    { href: "/admin/apply", label: "Apply videos" },
    { href: "/admin/apply-tiles", label: "Apply tiles" },
    { href: "/admin/points", label: "Points rules" },
    { href: "/admin/coupons", label: "Coupons" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 bg-shadow text-white p-5 md:min-h-screen">
        <div className="text-[10px] text-amber font-bold tracking-[2px] mb-1 break-all">{SITE_BRAND_MARK}</div>
        <div className="text-xl font-extrabold mb-1">Admin</div>
        <div className="text-xs text-white/50 mb-6 truncate">{displayName}</div>

        <nav className="space-y-1 mb-6">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}
              className="block px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition">
              {s.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="block text-xs text-amber font-semibold underline mb-3">
          ← Back to site
        </Link>
        <LogoutButton />
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl">{children}</main>
    </div>
  );
}
