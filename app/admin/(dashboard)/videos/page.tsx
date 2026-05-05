"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { WatchVideo } from "@/lib/types";
import { Trash2, Edit2, Plus, Play } from "lucide-react";

const empty = (): Partial<WatchVideo> => ({
  title: "", creator: "", duration: "", url: "", thumbnail_url: "", description: "",
  is_published: true, order_index: 0,
  published_at: new Date().toISOString().slice(0, 10),
});

export default function VideosAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<WatchVideo[]>([]);
  const [editing, setEditing] = useState<Partial<WatchVideo> | null>(null);

  async function load() {
    const { data } = await supabase.from("watch_videos").select("*").order("order_index");
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title || !editing?.creator || !editing?.url) {
      toast.show("Title, creator, URL required", "error"); return;
    }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("watch_videos").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("watch_videos").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("watch_videos").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Watch Videos</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add</Button>
      </div>
      <p className="text-sm text-muted mb-6">
        Videos shown in the Watch tab. Use <strong>Video of the week</strong> to pick 4 for Home.
      </p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit video" : "New video"}</h2>
          <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Creator" value={editing.creator || ""} onChange={(e) => setEditing({ ...editing, creator: e.target.value })} />
            <Input label="Duration (e.g. 8:42)" value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
          </div>
          <Input label="Video URL (YouTube or other)" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          <Input label="Thumbnail URL (optional)" value={editing.thumbnail_url || ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
          <Textarea label="Description (optional)" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={editing.published_at || ""}
              onChange={(e) => setEditing({ ...editing, published_at: e.target.value })} />
            <Input label="Order" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <Checkbox label="Published (visible to users)" checked={editing.is_published ?? true}
            onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((v) => (
          <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="w-20 h-14 bg-fuchsia rounded-lg flex items-center justify-center flex-shrink-0">
              <Play size={20} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {!v.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
                {v.duration && <span className="text-[10px] text-muted">{v.duration}</span>}
              </div>
              <div className="font-bold text-sm mb-1 line-clamp-1">{v.title}</div>
              <div className="text-xs text-muted">{v.creator}</div>
            </div>
            <button onClick={() => setEditing(v)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(v.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted text-sm">No videos yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
