"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { World } from "@/lib/types";
import { Trash2, Edit2, Plus, ChevronRight, Lock } from "lucide-react";

const empty = (): Partial<World> => ({
  title: "", slug: "", emoji: "", color: "#23CE68", description: null, order_index: 0, is_published: false, is_locked: false,
});

export default function WorldsAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<World[]>([]);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Partial<World> | null>(null);

  async function load() {
    const { data: worlds } = await supabase.from("worlds").select("*").order("order_index");
    setList(worlds || []);

    const { data: modules } = await supabase.from("modules").select("world_id");
    const counts: Record<string, number> = {};
    (modules || []).forEach((m: any) => {
      counts[m.world_id] = (counts[m.world_id] || 0) + 1;
    });
    setModuleCounts(counts);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.slug) { toast.show("Title and slug required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("worlds").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("worlds").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this world and all its modules + screens?")) return;
    const { error } = await supabase.from("worlds").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Worlds</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add world</Button>
      </div>
      <p className="text-sm text-muted mb-6">A world is a thematic group of modules. Click into one to manage its modules.</p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit world" : "New world"}</h2>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Slug (e.g. w1)" value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            <Input label="Emoji" value={editing.emoji || ""} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
            <Input label="Color (hex)" value={editing.color || "#23CE68"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
          </div>
          <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Input label="Description (optional)" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <Input label="Order (lower = first)" type="number" value={editing.order_index ?? 0}
            onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Checkbox label="Published (visible to users)" checked={editing.is_published ?? false}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <Checkbox label="Locked (guests see padlock, must log in to open)" checked={editing.is_locked ?? false}
              onChange={(e) => setEditing({ ...editing, is_locked: e.target.checked })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((w) => (
          <div key={w.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: w.color + "20" }}>
              {w.emoji || "🌐"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-bold text-sm">{w.title}</span>
                <span className="text-[10px] text-muted font-mono">{w.slug}</span>
                {!w.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
                {w.is_locked && (
                  <span className="text-[10px] font-bold bg-shadow text-amber px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Lock size={9} strokeWidth={3} /> LOCKED
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted">{moduleCounts[w.id] || 0} modules</div>
            </div>
            <Link href={`/admin/worlds/${w.id}`} className="text-xs font-semibold text-shadow flex items-center gap-1">
              Modules <ChevronRight size={14} />
            </Link>
            <button onClick={() => setEditing(w)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(w.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted text-sm">No worlds yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
