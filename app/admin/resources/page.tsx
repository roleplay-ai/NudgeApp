"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { Resource } from "@/lib/types";
import { Trash2, Edit2, Plus, ExternalLink } from "lucide-react";

const TYPES = ["article", "video", "course", "tool", "podcast", "book"];
const LEVELS = ["beginner", "intermediate", "advanced"];

const empty = (): Partial<Resource> => ({
  title: "", author: "", description: "", url: "", resource_type: "article",
  level: "beginner", category: "", thumbnail_url: null,
  is_featured: false, is_published: true, order_index: 0,
});

export default function ResourcesAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<Partial<Resource> | null>(null);

  async function load() {
    const { data } = await supabase.from("resources").select("*").order("order_index");
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.url) { toast.show("Title and URL required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("resources").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("resources").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this resource?")) return;
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Learning Resources</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add resource</Button>
      </div>
      <p className="text-sm text-muted mb-6">External articles, courses, and tools. Shown on Learn → Resources tab.</p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit resource" : "New resource"}</h2>
          <Input label="Title" value={(editing as any).title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value } as any)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={(editing as any).resource_type || "article"} options={TYPES}
              onChange={(e) => setEditing({ ...editing, resource_type: e.target.value } as any)} />
            <Select label="Level" value={(editing as any).level || "beginner"} options={LEVELS}
              onChange={(e) => setEditing({ ...editing, level: e.target.value } as any)} />
          </div>
          <Textarea label="Description" value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <Input label="URL" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Author (optional)" value={(editing as any).author || ""}
              onChange={(e) => setEditing({ ...editing, author: e.target.value } as any)} />
            <Input label="Category tag (optional)" value={(editing as any).category || ""}
              onChange={(e) => setEditing({ ...editing, category: e.target.value } as any)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Thumbnail URL (optional)" value={(editing as any).thumbnail_url || ""}
              onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value } as any)} />
            <Input label="Duration (mins, optional)" type="number" value={(editing as any).duration_mins || ""}
              onChange={(e) => setEditing({ ...editing, duration_mins: e.target.value ? parseInt(e.target.value) : null } as any)} />
          </div>
          <Input label="Order (lower = first)" type="number" value={editing.order_index ?? 0}
            onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          <div className="flex gap-4">
            <Checkbox label="Published" checked={(editing as any).is_published ?? true}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked } as any)} />
            <Checkbox label="Featured (shown first)" checked={editing.is_featured || false}
              onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="w-10 h-10 bg-nblue text-white font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">
              {r.thumbnail_url
                ? <img src={r.thumbnail_url} alt="" className="w-full h-full rounded-lg object-cover" />
                : r.title[0]
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm">{r.title}</span>
                {r.author && <span className="text-[10px] text-muted">by {r.author}</span>}
                <span className="text-[10px] font-bold bg-chiffon px-2 py-0.5 rounded-full capitalize">{r.resource_type}</span>
                {r.is_featured && <span className="text-[10px] font-bold bg-amber text-shadow px-2 py-0.5 rounded-full">★ FEATURED</span>}
                {!r.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
              </div>
              <div className="text-xs text-muted line-clamp-2">{r.description}</div>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-dodger flex items-center gap-1 mt-1 underline">
                <ExternalLink size={10} /> {r.url}
              </a>
            </div>
            <button onClick={() => setEditing(r)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(r.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted text-sm">No resources yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
