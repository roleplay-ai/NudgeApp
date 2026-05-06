"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { HomeBriefHero, NewsItem } from "@/lib/types";
import { Trash2, Edit2, Plus } from "lucide-react";

const TAGS = ["MODEL", "TOOL", "RESEARCH", "POLICY", "FEATURE", "TREND"];
const empty = (): Partial<NewsItem> => ({
  title: "", body: "", brief: "", tag: "MODEL", tag_color: "#ED4551", url: "",
  is_published: true, is_featured: false,
  published_at: new Date().toISOString().slice(0, 10),
});

export default function NewsAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [heroDraft, setHeroDraft] = useState<Partial<HomeBriefHero> | null>(null);

  async function load() {
    const { data } = await supabase.from("news_items").select("*").order("published_at", { ascending: false });
    setList(data || []);
  }

  async function loadHero() {
    const { data, error } = await supabase
      .from("home_brief_hero")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.show(error.message, "error");
      return;
    }

    if (!data) {
      const { data: inserted, error: insErr } = await supabase
        .from("home_brief_hero")
        .insert({
          badge_label: "NUDGEABLE BRIEF",
          title: "What changed in AI — fast",
          subtitle: "",
          byline_suffix: "Nudgeable Editorial",
          byline_override: null,
        })
        .select("*")
        .single();

      if (insErr) {
        toast.show(insErr.message, "error");
        return;
      }

      setHeroDraft(inserted as HomeBriefHero);
      return;
    }

    setHeroDraft(data as HomeBriefHero);
  }

  useEffect(() => {
    load();
    loadHero();
  }, []);

  async function saveHero() {
    if (!heroDraft?.badge_label?.trim() || !heroDraft?.title?.trim()) {
      toast.show("Badge label and title are required", "error");
      return;
    }

    const payload = {
      badge_label: heroDraft.badge_label.trim(),
      title: heroDraft.title.trim(),
      byline_suffix: heroDraft.byline_suffix?.trim() || "Nudgeable Editorial",
      byline_override: heroDraft.byline_override?.trim() ? heroDraft.byline_override.trim() : null,
    };

    if (heroDraft.id) {
      const { error } = await supabase.from("home_brief_hero").update(payload).eq("id", heroDraft.id);
      if (error) {
        toast.show(error.message, "error");
        return;
      }
    } else {
      const { error } = await supabase.from("home_brief_hero").insert(payload);
      if (error) {
        toast.show(error.message, "error");
        return;
      }
    }

    toast.show("Saved — Home brief header updated");
    await loadHero();
  }

  async function save() {
    if (!editing?.title || !editing?.body) { toast.show("Title and body required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("news_items").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("news_items").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("news_items").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">News & Updates</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add</Button>
      </div>

      {/* Home brief header (black hero card) */}
      {heroDraft && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 space-y-4 border border-black/5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold tracking-[0.14em] text-muted">HOME BRIEF HEADER</div>
              <div className="text-sm text-muted mt-1">
                Controls the badge label, title, and byline on the black hero card. The bullet content comes from news items marked “Featured on Home”.
              </div>
            </div>
            <Button onClick={saveHero}>Save header</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Badge label"
              value={heroDraft.badge_label || ""}
              onChange={(e) => setHeroDraft({ ...heroDraft, badge_label: e.target.value })}
            />
            <Input
              label="Title"
              value={heroDraft.title || ""}
              onChange={(e) => setHeroDraft({ ...heroDraft, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Byline suffix"
              value={heroDraft.byline_suffix || ""}
              onChange={(e) => setHeroDraft({ ...heroDraft, byline_suffix: e.target.value })}
              placeholder="Nudgeable Editorial"
            />
            <Input
              label="Byline override (optional)"
              value={heroDraft.byline_override ?? ""}
              onChange={(e) =>
                setHeroDraft({ ...heroDraft, byline_override: e.target.value === "" ? null : e.target.value })
              }
              placeholder="e.g. May 2026 · Nudgeable Editorial"
            />
          </div>
        </div>
      )}

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit news" : "New news item"}</h2>
          <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Textarea
            label="Brief (shown on home hero card)"
            value={editing.brief || ""}
            onChange={(e) => setEditing({ ...editing, brief: e.target.value })}
            placeholder="1–2 sentence teaser shown on the black hero card on the home page."
          />
          <Textarea label="Body (full detail)" value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tag" value={editing.tag || "MODEL"} options={TAGS}
              onChange={(e) => setEditing({ ...editing, tag: e.target.value })} />
            <Input label="Tag color (hex)" value={editing.tag_color || "#ED4551"}
              onChange={(e) => setEditing({ ...editing, tag_color: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={editing.published_at || ""}
              onChange={(e) => setEditing({ ...editing, published_at: e.target.value })} />
            <Input label="URL (optional)" value={editing.url || ""}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <Checkbox label="Published" checked={editing.is_published ?? true}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <Checkbox label="Featured on Home" checked={editing.is_featured || false}
              onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((n) => (
          <div key={n.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: n.tag_color || "#623CEA" }}>
                  {n.tag}
                </span>
                {n.is_featured && <span className="text-[10px] font-bold bg-amber text-shadow px-2 py-0.5 rounded-full">★ HOME</span>}
                {!n.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
                <span className="text-[10px] text-muted">{n.published_at}</span>
              </div>
              <div className="font-bold text-sm mb-1">{n.title}</div>
              {n.brief && <div className="text-xs text-amber font-medium line-clamp-1 mb-0.5">Brief: {n.brief}</div>}
              <div className="text-xs text-muted line-clamp-2">{n.body}</div>
            </div>
            <button onClick={() => setEditing(n)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(n.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted text-sm">No news yet. Click Add to create one.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
