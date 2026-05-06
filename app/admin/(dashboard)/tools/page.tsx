"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { Tool } from "@/lib/types";
import { Edit2, Plus, Trash2 } from "lucide-react";

const CATS = ["PPT", "Excel", "Image", "Video", "Voice", "Coding", "Research", "Writing", "Foundation Models", "Other"];

const empty = (): Partial<Tool> => ({
  name: "", category: "PPT", description: "", url: "",
  company: "", founded: null, pricing: "", best_for: "",
  color: "#623CEA", letter: "", is_published: true, is_featured: false, order_index: 0,
  pros: [], cons: [],
});

export default function ToolsAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<Tool[]>([]);
  const [editing, setEditing] = useState<Partial<Tool> | null>(null);
  const [prosText, setProsText] = useState("");
  const [consText, setConsText] = useState("");

  async function load() {
    const { data } = await supabase
      .from("tools")
      .select("*, tool_pros(text, order_index), tool_cons(text, order_index)")
      .order("order_index");
    const mapped = (data || []).map((t: any) => ({
      ...t,
      pros: (t.tool_pros || []).sort((a: any, b: any) => a.order_index - b.order_index).map((p: any) => p.text),
      cons: (t.tool_cons || []).sort((a: any, b: any) => a.order_index - b.order_index).map((c: any) => c.text),
    }));
    setList(mapped);
  }
  useEffect(() => { load(); }, []);

  function startEdit(t: Partial<Tool>) {
    setEditing(t);
    setProsText((t.pros || []).join("\n"));
    setConsText((t.cons || []).join("\n"));
  }

  async function save() {
    if (!editing?.name) { toast.show("Name required", "error"); return; }
    const pros = prosText.split("\n").map((l) => l.trim()).filter(Boolean);
    const cons = consText.split("\n").map((l) => l.trim()).filter(Boolean);

    const { pros: _p, cons: _c, ...toolPayload } = editing as any;
    let toolId = editing.id;

    if (toolId) {
      const { error } = await supabase.from("tools").update(toolPayload).eq("id", toolId);
      if (error) { toast.show(error.message, "error"); return; }
      await supabase.from("tool_pros").delete().eq("tool_id", toolId);
      await supabase.from("tool_cons").delete().eq("tool_id", toolId);
    } else {
      const { data, error } = await supabase.from("tools").insert(toolPayload).select("id").single();
      if (error) { toast.show(error.message, "error"); return; }
      toolId = data.id;
    }

    if (pros.length > 0) {
      await supabase.from("tool_pros").insert(pros.map((text, i) => ({ tool_id: toolId, text, order_index: i })));
    }
    if (cons.length > 0) {
      await supabase.from("tool_cons").insert(cons.map((text, i) => ({ tool_id: toolId, text, order_index: i })));
    }

    toast.show(editing.id ? "Saved" : "Created");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this tool?")) return;
    const { error } = await supabase.from("tools").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Tools</h1>
        <Button onClick={() => startEdit(empty())}><Plus size={14} className="inline mr-1" /> Add tool</Button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-3 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit tool" : "New tool"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Select label="Category" value={editing.category || "PPT"} options={CATS}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          </div>
          <Input label="Short description" value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Letter (avatar)" value={editing.letter || ""}
              onChange={(e) => setEditing({ ...editing, letter: e.target.value.slice(0, 1) })} />
            <Input label="Color (hex)" value={editing.color || "#623CEA"}
              onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
            <Input label="Order" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="Website URL" value={editing.url || ""}
            onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Company" value={editing.company || ""}
              onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
            <Input label="Founded year" type="number" value={editing.founded || ""}
              onChange={(e) => setEditing({ ...editing, founded: e.target.value ? parseInt(e.target.value) : null })} />
          </div>
          <Input label="Pricing (e.g., 'Free + Pro $10/mo')" value={editing.pricing || ""}
            onChange={(e) => setEditing({ ...editing, pricing: e.target.value })} />
          <Input label="Best for (one-liner)" value={editing.best_for || ""}
            onChange={(e) => setEditing({ ...editing, best_for: e.target.value })} />
          <Textarea label="Pros (one per line)" value={prosText} onChange={(e) => setProsText(e.target.value)} rows={3} />
          <Textarea label="Cons (one per line)" value={consText} onChange={(e) => setConsText(e.target.value)} rows={3} />
          <div className="flex gap-4">
            <Checkbox label="Published" checked={editing.is_published ?? true}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <Checkbox label="Featured (product of day highlight)" checked={editing.is_featured || false}
              onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
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
            <div className="w-10 h-10 rounded-lg text-white font-extrabold flex items-center justify-center flex-shrink-0"
              style={{ background: t.color || "#623CEA" }}>{t.letter || t.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-bold text-sm">{t.name}</span>
                <span className="text-[10px] bg-chiffon px-2 py-0.5 rounded-full font-bold">{t.category}</span>
                {!t.is_published && <span className="text-[10px] bg-muted text-white px-2 py-0.5 rounded-full font-bold">DRAFT</span>}
                {t.is_featured && <span className="text-[10px] bg-amber text-shadow px-2 py-0.5 rounded-full font-bold">★ FEATURED</span>}
              </div>
              <div className="text-xs text-muted truncate">{t.description}</div>
            </div>
            <button onClick={() => startEdit(t)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(t.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No tools yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
