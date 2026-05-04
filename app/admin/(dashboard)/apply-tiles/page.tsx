"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Checkbox, Button, Toast, useToast, Select } from "@/components/admin/Form";
import type { ApplyTile } from "@/lib/types";
import { Edit2, Plus } from "lucide-react";

const GROUPS = ["Features", "Apps", "Workflows", "Skills"];

const empty = (): Partial<ApplyTile> => ({
  title: "",
  subtitle: "",
  group_name: "Features",
  is_featured: false,
  order_index: 0,
  icon_url: null,
  icon_color: "#A855F7",
  category_tag: "",
  what_it_does: "",
  video_url: "",
  estimated_duration: "",
  available_in: [],
});

function platformsToJson(tile: Partial<ApplyTile>): string {
  const v = tile.available_in as unknown;
  if (Array.isArray(v)) return JSON.stringify(v, null, 2);
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v) as unknown;
      return JSON.stringify(Array.isArray(p) ? p : [], null, 2);
    } catch {
      return "[]";
    }
  }
  return "[]";
}

function parsePlatformsJson(s: string): unknown[] {
  const t = s.trim();
  if (!t) return [];
  const parsed = JSON.parse(t) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Available in must be a JSON array");
  return parsed;
}

export default function ApplyTilesAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<ApplyTile[]>([]);
  const [editing, setEditing] = useState<Partial<ApplyTile> | null>(null);
  const [platformsJson, setPlatformsJson] = useState("[]");

  async function load() {
    const { data, error } = await supabase.from("apply_tiles").select("*").order("group_name").order("order_index");
    if (error) toast.show(error.message, "error");
    setList((data || []) as ApplyTile[]);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editing) setPlatformsJson(platformsToJson(editing));
  }, [editing?.id]);

  async function save() {
    if (!editing?.title?.trim() || !editing?.subtitle?.trim()) {
      toast.show("Title and subtitle required", "error");
      return;
    }
    let available_in: unknown[] = [];
    try {
      available_in = parsePlatformsJson(platformsJson);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Invalid JSON for Available in", "error");
      return;
    }

    const payload: Record<string, unknown> = {
      title: editing.title?.trim(),
      subtitle: editing.subtitle?.trim(),
      group_name: editing.group_name || "Features",
      is_featured: editing.is_featured ?? false,
      order_index: editing.order_index ?? 0,
      icon_url: editing.icon_url || null,
      icon_color: editing.icon_color || null,
      category_tag: editing.category_tag?.trim() || null,
      what_it_does: editing.what_it_does?.trim() || null,
      video_url: editing.video_url?.trim() || null,
      estimated_duration: editing.estimated_duration?.trim() || null,
      available_in,
    };

    if (editing.id) {
      const { error } = await supabase.from("apply_tiles").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else {
        toast.show("Saved");
        setEditing(null);
        load();
      }
    } else {
      const { error } = await supabase.from("apply_tiles").insert(payload);
      if (error) toast.show(error.message, "error");
      else {
        toast.show("Created");
        setEditing(null);
        load();
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Apply tiles</h1>
        <Button onClick={() => setEditing(empty())}>
          <Plus size={14} className="inline mr-1" /> Add tile
        </Button>
      </div>
      <p className="text-sm text-muted mb-8 max-w-2xl">
        Cards on the user <strong className="text-shadow">Apply</strong> page. Set{" "}
        <strong>What it does</strong>, <strong>Video URL</strong> (YouTube watch link), and{" "}
        <strong>Available in</strong> as a JSON array of <code className="text-xs bg-chiffon px-1 rounded">name</code>{" "}
        + <code className="text-xs bg-chiffon px-1 rounded">color</code> (hex).
      </p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit tile" : "New tile"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Select
              label="Group"
              value={(editing.group_name as string) || "Features"}
              options={GROUPS}
              onChange={(e) => setEditing({ ...editing, group_name: e.target.value })}
            />
          </div>
          <Input
            label="Subtitle (short line on card + modal)"
            value={editing.subtitle || ""}
            onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
          />
          <Input
            label="Category tag (card pill, e.g. Editing)"
            value={editing.category_tag || ""}
            onChange={(e) => setEditing({ ...editing, category_tag: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Icon color (hex)"
              value={editing.icon_color || ""}
              onChange={(e) => setEditing({ ...editing, icon_color: e.target.value || null })}
            />
            <Input
              label="Icon image URL (optional)"
              value={editing.icon_url || ""}
              onChange={(e) => setEditing({ ...editing, icon_url: e.target.value || null })}
            />
          </div>
          <Input
            label="YouTube / video URL (optional)"
            value={editing.video_url || ""}
            onChange={(e) => setEditing({ ...editing, video_url: e.target.value || null })}
          />
          <Input
            label="Card duration hint (optional, e.g. ~1 min)"
            value={editing.estimated_duration || ""}
            onChange={(e) => setEditing({ ...editing, estimated_duration: e.target.value || null })}
          />
          <Textarea
            label="What it does (modal body)"
            value={editing.what_it_does || ""}
            onChange={(e) => setEditing({ ...editing, what_it_does: e.target.value })}
            rows={5}
          />
          <Textarea
            label='Available in (JSON array, e.g. [{"name":"ChatGPT","color":"#23CE68"}])'
            value={platformsJson}
            onChange={(e) => setPlatformsJson(e.target.value)}
            rows={5}
          />
          <Input
            label="Order index"
            type="number"
            value={editing.order_index ?? 0}
            onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value, 10) || 0 })}
          />
          <Checkbox
            label="Featured"
            checked={editing.is_featured ?? false}
            onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div
              className="w-10 h-10 text-white font-extrabold rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: t.icon_color || "#623CEA" }}
            >
              {t.icon_url ? <img src={t.icon_url} alt="" className="w-full h-full object-cover rounded-lg" /> : t.title[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{t.title}</div>
              <div className="text-xs text-muted line-clamp-2">{t.subtitle}</div>
              <div className="text-[10px] text-muted mt-1">
                {t.group_name}
                {t.category_tag ? ` · ${t.category_tag}` : ""}
              </div>
            </div>
            <button type="button" onClick={() => setEditing({ ...t })} className="text-muted hover:text-shadow p-1">
              <Edit2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
