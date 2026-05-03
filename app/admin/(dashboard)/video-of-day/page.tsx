"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { VideoOfDay, WatchVideo } from "@/lib/types";
import { setExclusiveActiveRow } from "@/lib/admin/setExclusiveActive";
import { Edit2, Plus, Trash2 } from "lucide-react";

const selectClass =
  "w-full bg-chiffon rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber";

const empty = (): Partial<VideoOfDay> => ({
  title: "",
  url: "",
  duration: "",
  creator: "",
  thumbnail_url: "",
  is_active: false,
  active_date: new Date().toISOString().slice(0, 10),
});

export default function VideoOfDayAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<VideoOfDay[]>([]);
  const [editing, setEditing] = useState<Partial<VideoOfDay> | null>(null);
  const [watchVideos, setWatchVideos] = useState<WatchVideo[]>([]);
  const [pickedWatchId, setPickedWatchId] = useState("");

  async function load() {
    const { data } = await supabase.from("video_of_day").select("*").order("active_date", { ascending: false });
    setList((data || []) as VideoOfDay[]);
  }

  async function loadWatchVideos() {
    const { data } = await supabase.from("watch_videos").select("*").order("order_index");
    setWatchVideos((data || []) as WatchVideo[]);
  }

  useEffect(() => {
    load();
    loadWatchVideos();
  }, []);

  function applyWatchVideo(id: string) {
    setPickedWatchId(id);
    if (!id) return;
    const v = watchVideos.find((x) => x.id === id);
    if (!v || !editing) return;
    setEditing({
      ...editing,
      title: v.title,
      url: v.url,
      duration: v.duration || "",
      creator: v.creator,
      thumbnail_url: v.thumbnail_url || "",
    });
  }

  async function save() {
    if (!editing?.title || !editing?.url || !editing?.creator) {
      toast.show("Title, URL, and creator required", "error");
      return;
    }

    const wantActive = !!editing.is_active;
    const payload: Record<string, unknown> = {
      title: editing.title,
      url: editing.url,
      duration: editing.duration || "",
      creator: editing.creator,
      thumbnail_url: editing.thumbnail_url?.trim() || null,
      active_date: editing.active_date || new Date().toISOString().slice(0, 10),
      is_active: false,
    };

    let rowId = editing.id;

    if (rowId) {
      const { error } = await supabase.from("video_of_day").update(payload).eq("id", rowId);
      if (error) {
        toast.show(error.message, "error");
        return;
      }
    } else {
      const { data: inserted, error } = await supabase.from("video_of_day").insert(payload).select("id").single();
      if (error) {
        toast.show(error.message, "error");
        return;
      }
      rowId = inserted.id;
    }

    if (wantActive && rowId) {
      const r = await setExclusiveActiveRow(supabase, "video_of_day", rowId);
      if (!r.ok) {
        toast.show(r.message, "error");
        return;
      }
    }

    toast.show("Saved");
    setPickedWatchId("");
    setEditing(null);
    load();
  }

  async function activate(id: string) {
    const r = await setExclusiveActiveRow(supabase, "video_of_day", id);
    if (!r.ok) toast.show(r.message, "error");
    else {
      toast.show("Activated — this video shows on Home");
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this row?")) return;
    const { error } = await supabase.from("video_of_day").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else {
      toast.show("Deleted");
      load();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Video of day</h1>
        <Button
          onClick={() => {
            setPickedWatchId("");
            setEditing(empty());
          }}
        >
          <Plus size={14} className="inline mr-1" /> Add
        </Button>
      </div>
      <p className="text-sm text-muted mb-6">
        Home shows the row marked <strong>ACTIVE</strong>. Pick a row from <strong>Watch → Videos</strong> to copy its fields, or type manually. Click <strong>Activate</strong> to switch which one appears on Home.
      </p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit" : "New"} video of day</h2>
          <label className="block">
            <span className="block text-xs font-semibold text-shadow mb-1">Fill from Watch library (all saved videos)</span>
            <select
              className={selectClass}
              value={pickedWatchId}
              onChange={(e) => applyWatchVideo(e.target.value)}
            >
              <option value="">— Choose a video (optional) —</option>
              {watchVideos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title} — {v.creator}
                  {!v.is_published ? " (draft)" : ""}
                </option>
              ))}
            </select>
          </label>
          <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Input label="Video URL" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Creator" value={editing.creator || ""} onChange={(e) => setEditing({ ...editing, creator: e.target.value })} />
            <Input label="Duration (e.g. 12:34)" value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
          </div>
          <Input label="Thumbnail URL (optional)" value={editing.thumbnail_url || ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
          <Input label="Active date" type="date" value={editing.active_date?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, active_date: e.target.value })} />
          <Checkbox
            label="Show on Home (make this the active video — others become inactive)"
            checked={!!editing.is_active}
            onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPickedWatchId("");
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((v) => (
          <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm">{v.title}</span>
                {v.is_active && (
                  <span className="text-[10px] font-bold bg-emerald text-white px-2 py-0.5 rounded-full">● ACTIVE</span>
                )}
              </div>
              <div className="text-xs text-muted">{v.creator}</div>
              <div className="text-[11px] text-muted mt-1">{v.active_date}</div>
            </div>
            {!v.is_active && (
              <button
                type="button"
                onClick={() => activate(v.id)}
                className="text-xs font-semibold text-emerald border border-emerald px-2 py-1 rounded-lg hover:bg-emerald hover:text-white transition flex-shrink-0"
              >
                Activate
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const match = watchVideos.find((w) => w.url === v.url && w.title === v.title);
                setPickedWatchId(match?.id ?? "");
                setEditing(v);
              }}
              className="text-muted hover:text-shadow flex-shrink-0"
            >
              <Edit2 size={16} />
            </button>
            <button type="button" onClick={() => remove(v.id)} className="text-fuchsia hover:opacity-70 flex-shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No rows yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
