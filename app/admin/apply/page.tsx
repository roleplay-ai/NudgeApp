"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { ApplyTask } from "@/lib/types";
import { Edit2, Plus, Trash2, ChevronRight } from "lucide-react";

const empty = (): Partial<ApplyTask> => ({
  title: "", subtitle: "", color: "#623CEA", icon_letter: "",
  is_daily: false, is_published: true, order_index: 0, xp_reward: 5,
});

export default function ApplyAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<ApplyTask[]>([]);
  const [editing, setEditing] = useState<Partial<ApplyTask> | null>(null);

  async function load() {
    const { data } = await supabase.from("apply_tasks").select("*").order("order_index");
    setList((data || []) as ApplyTask[]);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.subtitle) { toast.show("Title and subtitle required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("apply_tasks").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("apply_tasks").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this task and all its slides?")) return;
    const { error } = await supabase.from("apply_tasks").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Apply Tasks</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add task</Button>
      </div>
      <p className="text-sm text-muted mb-6">Each task holds a slideshow of steps with prompts.</p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit task" : "New task"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Input label="Icon letter (single char)" value={editing.icon_letter || ""}
              onChange={(e) => setEditing({ ...editing, icon_letter: e.target.value.slice(0, 1) })} />
          </div>
          <Input label="Subtitle" value={editing.subtitle || ""}
            onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Color (hex)" value={editing.color || "#623CEA"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
            <Input label="XP reward" type="number" value={editing.xp_reward ?? 5} onChange={(e) => setEditing({ ...editing, xp_reward: parseInt(e.target.value) || 5 })} />
            <Input label="Order" type="number" value={editing.order_index ?? 0} onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-4">
            <Checkbox label="Published" checked={editing.is_published ?? true}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <Checkbox label="Is daily (shows Today badge)" checked={editing.is_daily || false}
              onChange={(e) => setEditing({ ...editing, is_daily: e.target.checked })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="bg-white rounded-xl p-3 shadow-sm flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
              style={{ background: t.color || "#623CEA" }}>
              {t.icon_letter || t.title[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-bold text-sm">{t.title}</span>
                {t.is_daily && <span className="text-[10px] font-bold bg-amber text-shadow px-2 py-0.5 rounded-full">TODAY</span>}
                {!t.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
              </div>
              <div className="text-xs text-muted">{t.subtitle}</div>
            </div>
            <Link href={`/admin/apply/${t.id}`}
              className="text-xs font-semibold text-dodger hover:underline flex items-center">
              Slides <ChevronRight size={14} />
            </Link>
            <button onClick={() => setEditing(t)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(t.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No tasks yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
