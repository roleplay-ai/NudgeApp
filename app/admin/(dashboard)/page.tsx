import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [news, watchVideos, videoOfDay, productOfDay, tools, glossary, worlds, modules, applyVideos, resources, users] =
    await Promise.all([
      supabase.from("news_items").select("id", { count: "exact", head: true }),
      supabase.from("watch_videos").select("id", { count: "exact", head: true }),
      supabase.from("video_of_day").select("id", { count: "exact", head: true }),
      supabase.from("product_of_day").select("id", { count: "exact", head: true }),
      supabase.from("tools").select("id", { count: "exact", head: true }),
      supabase.from("glossary_terms").select("id", { count: "exact", head: true }),
      supabase.from("worlds").select("id", { count: "exact", head: true }),
      supabase.from("modules").select("id", { count: "exact", head: true }),
      supabase.from("apply_videos").select("id", { count: "exact", head: true }),
      supabase.from("resources").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "News items", count: news.count ?? 0, color: "bg-amber" },
    { label: "Watch videos", count: watchVideos.count ?? 0, color: "bg-fuchsia" },
    { label: "Video of day rows", count: videoOfDay.count ?? 0, color: "bg-norange" },
    { label: "Product of day rows", count: productOfDay.count ?? 0, color: "bg-nblue" },
    { label: "Tools", count: tools.count ?? 0, color: "bg-dodger" },
    { label: "Glossary terms", count: glossary.count ?? 0, color: "bg-emerald" },
    { label: "Worlds", count: worlds.count ?? 0, color: "bg-nblue" },
    { label: "Modules", count: modules.count ?? 0, color: "bg-norange" },
    { label: "Apply videos", count: applyVideos.count ?? 0, color: "bg-shadow" },
    { label: "Resources", count: resources.count ?? 0, color: "bg-fuchsia" },
    { label: "Users", count: users.count ?? 0, color: "bg-emerald" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Dashboard</h1>
      <p className="text-muted mb-8">Manage all content from the sidebar.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${s.color} mb-3`} />
            <div className="text-3xl font-extrabold">{s.count}</div>
            <div className="text-xs text-muted font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
