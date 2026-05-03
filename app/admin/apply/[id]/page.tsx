"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Button, Toast, useToast } from "@/components/admin/Form";
import ImageUploader from "@/components/admin/ImageUploader";
import type { ApplySlide, ApplyTask } from "@/lib/types";
import { Edit2, Plus, Trash2, ChevronLeft } from "lucide-react";

const MOCK_TYPES = ["browser-generic", "chat-paste", "gamma-home", "doc-editor", "spreadsheet", "custom"];

const empty = (task_id: string): Partial<ApplySlide> => ({
  task_id, caption: "", prompt_text: "", mock_type: "browser-generic", image_url: null, order_index: 0,
});

export default function SlidesAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const toast = useToast();
  const [task, setTask] = useState<ApplyTask | null>(null);
  const [list, setList] = useState<ApplySlide[]>([]);
  const [editing, setEditing] = useState<Partial<ApplySlide> | null>(null);

  async function load() {
    const [{ data: t }, { data: s }] = await Promise.all([
      supabase.from("apply_tasks").select("*").eq("id", id).single(),
      supabase.from("apply_slides").select("*").eq("task_id", id).order("order_index"),
    ]);
    setTask(t as ApplyTask);
    setList((s || []) as ApplySlide[]);
  }
  useEffect(() => { load(); }, [id]);

  async function save() {
    if (!editing?.caption) { toast.show("Caption required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("apply_slides").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("apply_slides").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Added"); setEditing(null); load(); }
    }
  }

  async function remove(slideId: string) {
    if (!confirm("Delete this slide?")) return;
    const { error } = await supabase.from("apply_slides").delete().eq("id", slideId);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  if (!task) return <div>Loading…</div>;

  return (
    <div>
      <Link href="/admin/apply" className="text-sm text-muted hover:text-shadow inline-flex items-center mb-4">
        <ChevronLeft size={14} /> Back to tasks
      </Link>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold">{task.title}</h1>
          <p className="text-sm text-muted">{task.subtitle}</p>
        </div>
        <Button onClick={() => setEditing(empty(id))}><Plus size={14} className="inline mr-1" /> Add slide</Button>
      </div>
      <p className="text-xs text-muted mb-6">Each slide = instruction caption + optional prompt block + optional screenshot.</p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit slide" : "New slide"}</h2>
          <Input label="Caption (instruction shown to user)" value={editing.caption || ""}
            onChange={(e) => setEditing({ ...editing, caption: e.target.value })} />
          <Textarea label="Prompt text (copyable block — optional)" value={editing.prompt_text || ""}
            onChange={(e) => setEditing({ ...editing, prompt_text: e.target.value })} rows={4} />
          <div>
            <span className="block text-xs font-semibold text-shadow mb-2">Screenshot (optional)</span>
            <ImageUploader folder="apply" value={editing.image_url || null}
              onChange={(url) => setEditing({ ...editing, image_url: url })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Mock type" value={editing.mock_type || "browser-generic"} options={MOCK_TYPES}
              onChange={(e) => setEditing({ ...editing, mock_type: e.target.value })} />
            <Input label="Order (lower = first)" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((s, i) => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="text-xs font-bold text-muted w-6">{i + 1}</div>
            {s.image_url ? (
              <img src={s.image_url} alt="" className="w-20 h-14 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-14 rounded bg-nborder/30 text-[10px] text-muted flex items-center justify-center flex-shrink-0">
                {s.mock_type}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{s.caption}</div>
              {s.prompt_text && (
                <div className="text-xs text-muted line-clamp-2 mt-0.5 bg-chiffon px-2 py-1 rounded mt-1">
                  {s.prompt_text}
                </div>
              )}
            </div>
            <button onClick={() => setEditing(s)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(s.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No slides yet. Add the first one.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
