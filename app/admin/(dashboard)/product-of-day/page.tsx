"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { ProductOfDay, Tool } from "@/lib/types";
import { setExclusiveActiveRow } from "@/lib/admin/setExclusiveActive";
import { Edit2, Plus, Trash2 } from "lucide-react";

const selectClass =
  "w-full bg-chiffon rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber";

const empty = (): Partial<ProductOfDay> => ({
  name: "",
  tagline: "",
  description: "",
  url: "",
  image_url: "",
  tool_id: null,
  is_active: false,
  active_date: new Date().toISOString().slice(0, 10),
});

export default function ProductOfDayAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<ProductOfDay[]>([]);
  const [editing, setEditing] = useState<Partial<ProductOfDay> | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);

  async function load() {
    const { data } = await supabase.from("product_of_day").select("*").order("active_date", { ascending: false });
    setList((data || []) as ProductOfDay[]);
  }

  async function loadTools() {
    const { data } = await supabase.from("tools").select("*").order("order_index");
    setTools((data || []) as Tool[]);
  }

  useEffect(() => {
    load();
    loadTools();
  }, []);

  function applyTool(id: string) {
    if (!editing) return;
    if (!id) {
      setEditing({ ...editing, tool_id: null });
      return;
    }
    const t = tools.find((x) => x.id === id);
    if (!t) return;
    const description =
      (t.description && t.description.trim()) || (t.best_for && t.best_for.trim()) || t.name;
    setEditing({
      ...editing,
      tool_id: id,
      name: t.name,
      tagline: (t.best_for && t.best_for.trim()) || t.category || (t.company ?? "") || "",
      description,
      url: (t.url && t.url.trim()) || "",
      image_url: (t.logo_url && t.logo_url.trim()) || "",
    });
  }

  async function save() {
    if (!editing?.name || !editing?.url || !editing?.description) {
      toast.show("Name, URL, and description required", "error");
      return;
    }

    const wantActive = !!editing.is_active;
    const payload: Record<string, unknown> = {
      name: editing.name,
      tagline: editing.tagline || "",
      description: editing.description,
      url: editing.url,
      image_url: editing.image_url?.trim() || null,
      tool_id: editing.tool_id?.trim() || null,
      active_date: editing.active_date || new Date().toISOString().slice(0, 10),
      is_active: false,
    };

    let rowId = editing.id;

    if (rowId) {
      const { error } = await supabase.from("product_of_day").update(payload).eq("id", rowId);
      if (error) {
        toast.show(error.message, "error");
        return;
      }
    } else {
      const { data: inserted, error } = await supabase.from("product_of_day").insert(payload).select("id").single();
      if (error) {
        toast.show(error.message, "error");
        return;
      }
      rowId = inserted.id;
    }

    if (wantActive && rowId) {
      const r = await setExclusiveActiveRow(supabase, "product_of_day", rowId);
      if (!r.ok) {
        toast.show(r.message, "error");
        return;
      }
    }

    toast.show("Saved");
    setEditing(null);
    load();
  }

  async function activate(id: string) {
    const r = await setExclusiveActiveRow(supabase, "product_of_day", id);
    if (!r.ok) toast.show(r.message, "error");
    else {
      toast.show("Activated — this product shows on Home");
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this row?")) return;
    const { error } = await supabase.from("product_of_day").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else {
      toast.show("Deleted");
      load();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Product of day</h1>
        <Button onClick={() => setEditing(empty())}>
          <Plus size={14} className="inline mr-1" /> Add
        </Button>
      </div>
      <p className="text-sm text-muted mb-6">
        Home shows the row marked <strong>ACTIVE</strong>. Choose a tool from your <strong>Tools</strong> library to fill name, URL, and image; you can edit after. Or type everything manually.
      </p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit" : "New"} product of day</h2>
          <label className="block">
            <span className="block text-xs font-semibold text-shadow mb-1">Fill from Tools library (all tools)</span>
            <select
              className={selectClass}
              value={editing.tool_id || ""}
              onChange={(e) => applyTool(e.target.value)}
            >
              <option value="">— Choose a tool (optional) —</option>
              {tools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.category}
                  {!t.is_published ? " (draft)" : ""}
                </option>
              ))}
            </select>
          </label>
          <Input label="Name" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <Input label="Tagline" value={editing.tagline || ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} />
          <Textarea label="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
          <Input label="URL" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          <Input label="Image URL (optional)" value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          <Input label="Active date" type="date" value={editing.active_date?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, active_date: e.target.value })} />
          <Checkbox
            label="Show on Home (make this the active product — others become inactive)"
            checked={!!editing.is_active}
            onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm">{p.name}</span>
                {p.is_active && (
                  <span className="text-[10px] font-bold bg-emerald text-white px-2 py-0.5 rounded-full">● ACTIVE</span>
                )}
              </div>
              <div className="text-xs text-muted">{p.tagline}</div>
              <div className="text-[11px] text-muted mt-1">{p.active_date}</div>
            </div>
            {!p.is_active && (
              <button
                type="button"
                onClick={() => activate(p.id)}
                className="text-xs font-semibold text-emerald border border-emerald px-2 py-1 rounded-lg hover:bg-emerald hover:text-white transition flex-shrink-0"
              >
                Activate
              </button>
            )}
            <button type="button" onClick={() => setEditing(p)} className="text-muted hover:text-shadow flex-shrink-0">
              <Edit2 size={16} />
            </button>
            <button type="button" onClick={() => remove(p.id)} className="text-fuchsia hover:opacity-70 flex-shrink-0">
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
