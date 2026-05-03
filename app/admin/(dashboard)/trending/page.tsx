"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { TrendingTopic } from "@/lib/types";
import { Edit2, Plus, Trash2 } from "lucide-react";

const empty = (): Partial<TrendingTopic> => ({
  title: "", subtitle: "", body: "", why_matters: "", emoji: "🤖", is_active: false,
});

export default function TrendingAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<TrendingTopic[]>([]);
  const [editing, setEditing] = useState<Partial<TrendingTopic> | null>(null);

  async function load() {
    const { data } = await supabase.from("trending_topics").select("*").order("created_at", { ascending: false });
    setList((data || []) as TrendingTopic[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.body) { toast.show("Title and body required", "error"); return; }
    // Use the RPC to safely switch active state (enforces only one can be active)
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("trending_topics").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else {
        if (editing.is_active) {
          await supabase.rpc("set_active_trending", { p_id: editing.id });
        }
        toast.show("Saved"); setEditing(null); load();
      }
    } else {
      const insertPayload = { ...payload };
      delete insertPayload.is_active;
      const { data: inserted, error } = await supabase.from("trending_topics").insert(insertPayload).select("id").single();
      if (error) toast.show(error.message, "error");
      else {
        if (editing.is_active && inserted?.id) {
          await supabase.rpc("set_active_trending", { p_id: inserted.id });
        }
        toast.show("Created"); setEditing(null); load();
      }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this trend?")) return;
    const { error } = await supabase.from("trending_topics").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  async function activate(id: string) {
    const { error } = await supabase.rpc("set_active_trending", { p_id: id });
    if (error) toast.show(error.message, "error");
    else { toast.show("Activated"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Trending Now</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add trend</Button>
      </div>
      <p className="text-sm text-muted mb-6">Hero card on home. Only one can be active at a time. Use "Activate" to switch.</p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit trend" : "New trend"}</h2>
          <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Input label="Subtitle" value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
          <Input label="Emoji" value={editing.emoji || ""} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
          <Textarea label="Body (full description)" value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={4} />
          <Textarea label="Why this matters" value={editing.why_matters || ""}
            onChange={(e) => setEditing({ ...editing, why_matters: e.target.value })} rows={2} />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((t) => (
          <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="text-3xl flex-shrink-0">{t.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{t.title}</span>
                {t.is_active && <span className="text-[10px] font-bold bg-emerald text-white px-2 py-0.5 rounded-full">● ACTIVE</span>}
              </div>
              <div className="text-xs text-muted">{t.subtitle}</div>
            </div>
            {!t.is_active && (
              <button onClick={() => activate(t.id)}
                className="text-xs font-semibold text-emerald border border-emerald px-2 py-1 rounded-lg hover:bg-emerald hover:text-white transition">
                Activate
              </button>
            )}
            <button onClick={() => setEditing(t)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(t.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No trends yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
