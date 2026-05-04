"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Checkbox, Button, Toast, useToast, Select } from "@/components/admin/Form";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoUploader from "@/components/admin/VideoUploader";
import type { ApplyVideo } from "@/lib/types";
import { Edit2, Plus, Trash2, Film } from "lucide-react";

const GROUPS = ["Features", "Apps", "Workflows", "Skills"] as const;

const emptyVideo = (): Partial<ApplyVideo> => ({
  title: "",
  description: "",
  video_url: "",
  thumbnail_url: null,
  duration: "",
  order_index: 0,
  is_published: true,
  task_id: null,
  group_name: "Features",
  category_tag: "",
});

export default function ApplyVideosAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [videos, setVideos] = useState<ApplyVideo[]>([]);
  const [editingVideo, setEditingVideo] = useState<Partial<ApplyVideo> | null>(null);

  async function load() {
    const { data } = await supabase.from("apply_videos").select("*").order("order_index");
    setVideos((data || []) as ApplyVideo[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function saveVideo() {
    if (!editingVideo?.title?.trim()) {
      toast.show("Title required", "error");
      return;
    }
    if (!editingVideo?.video_url) {
      toast.show("Upload a video file first", "error");
      return;
    }
    const published = editingVideo.is_published !== false;
    if (published && !(editingVideo.description || "").trim()) {
      toast.show("Description is required for published videos (shown on Apply)", "error");
      return;
    }
    const payload: Record<string, unknown> = {
      title: editingVideo.title?.trim(),
      description: (editingVideo.description || "").trim() || null,
      video_url: editingVideo.video_url,
      thumbnail_url: editingVideo.thumbnail_url ?? null,
      duration: editingVideo.duration || null,
      order_index: editingVideo.order_index ?? 0,
      is_published: editingVideo.is_published ?? true,
      task_id: editingVideo.task_id ?? null,
      group_name: (editingVideo.group_name as string) || "Features",
      category_tag: editingVideo.category_tag?.trim() || null,
    };
    if (editingVideo.id) {
      const { error } = await supabase.from("apply_videos").update(payload).eq("id", editingVideo.id);
      if (error) toast.show(error.message, "error");
      else {
        toast.show("Saved");
        setEditingVideo(null);
        load();
      }
    } else {
      const { error } = await supabase.from("apply_videos").insert(payload);
      if (error) toast.show(error.message, "error");
      else {
        toast.show("Added");
        setEditingVideo(null);
        load();
      }
    }
  }

  async function removeVideo(videoId: string) {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("apply_videos").delete().eq("id", videoId);
    if (error) toast.show(error.message, "error");
    else {
      toast.show("Deleted");
      load();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Apply videos</h1>
        <Button onClick={() => setEditingVideo(emptyVideo())}>
          <Plus size={14} className="inline mr-1" /> Add video
        </Button>
      </div>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Upload a video file and add a title and description. Published videos appear on the user{" "}
        <strong className="text-shadow">Apply</strong> page as a single feed. Files use Supabase Storage (
        <code className="text-xs">content</code> bucket). No separate tasks — only clips.
      </p>

      {editingVideo && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editingVideo.id ? "Edit video" : "New video"}</h2>
          <Input
            label="Title (shown on Apply)"
            value={editingVideo.title || ""}
            onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Group (Apply filter chip)"
              value={(editingVideo.group_name as string) || "Features"}
              options={[...GROUPS]}
              onChange={(e) => setEditingVideo({ ...editingVideo, group_name: e.target.value })}
            />
            <Input
              label="Category pill (e.g. EDITING, optional)"
              value={editingVideo.category_tag || ""}
              onChange={(e) => setEditingVideo({ ...editingVideo, category_tag: e.target.value })}
            />
          </div>
          <Textarea
            label="Description (shown under the title on Apply)"
            value={editingVideo.description || ""}
            onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
            rows={3}
          />
          <p className="text-[10px] text-muted -mt-2">
            Required when <span className="font-semibold">Published</span> is on.
          </p>
          <div>
            <span className="block text-xs font-semibold text-shadow mb-2">Video file *</span>
            <VideoUploader
              value={editingVideo.video_url || null}
              onChange={(url, meta) =>
                setEditingVideo((ev) =>
                  ev
                    ? {
                        ...ev,
                        video_url: url || "",
                        duration: url
                          ? meta?.duration != null && meta.duration !== ""
                            ? meta.duration
                            : ""
                          : "",
                      }
                    : null,
                )
              }
            />
            {editingVideo.video_url ? (
              <video
                src={editingVideo.video_url}
                controls
                playsInline
                className="mt-3 w-full max-h-56 rounded-xl bg-black object-contain"
              />
            ) : null}
          </div>
          <div>
            <span className="block text-xs font-semibold text-shadow mb-2">Thumbnail image (optional)</span>
            <ImageUploader
              folder="apply-thumbs"
              value={editingVideo.thumbnail_url || null}
              onChange={(url) => setEditingVideo({ ...editingVideo, thumbnail_url: url })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label='Duration (filled automatically from video; edit if needed)'
              value={editingVideo.duration || ""}
              onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
            />
            <Input
              label="Order (lower = first)"
              type="number"
              value={editingVideo.order_index ?? 0}
              onChange={(e) => setEditingVideo({ ...editingVideo, order_index: parseInt(e.target.value, 10) || 0 })}
            />
            <div className="flex items-end pb-1">
              <Checkbox
                label="Published"
                checked={editingVideo.is_published ?? true}
                onChange={(e) => setEditingVideo({ ...editingVideo, is_published: e.target.checked })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveVideo}>Save</Button>
            <Button variant="ghost" onClick={() => setEditingVideo(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {videos.map((v, i) => (
          <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-center">
            <div className="text-xs font-bold text-muted w-6">{i + 1}</div>
            {v.thumbnail_url ? (
              <img src={v.thumbnail_url} alt="" className="w-20 h-14 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-14 rounded bg-shadow flex items-center justify-center flex-shrink-0">
                <Film size={20} className="text-amber" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm flex items-center gap-2 flex-wrap">
                {v.title}
                {v.duration ? (
                  <span className="text-[10px] font-semibold text-muted bg-chiffon px-2 py-0.5 rounded-full">
                    {v.duration}
                  </span>
                ) : null}
                {!v.is_published ? (
                  <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>
                ) : null}
              </div>
              {v.description ? (
                <div className="text-xs text-muted line-clamp-2 mt-0.5">{v.description}</div>
              ) : null}
            </div>
            <button type="button" onClick={() => setEditingVideo(v)} className="text-muted hover:text-shadow">
              <Edit2 size={16} />
            </button>
            <button type="button" onClick={() => removeVideo(v.id)} className="text-fuchsia hover:opacity-70">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {videos.length === 0 && <div className="text-sm text-muted">No videos yet. Add the first walkthrough.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
