"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { GlossaryTerm } from "@/lib/types";
import { Trash2, Edit2, Plus } from "lucide-react";

const empty = (): Partial<GlossaryTerm> => ({
  term: "", definition: "", color: "#623CEA", is_published: true, order_index: 0,
});

export default function GlossaryAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<GlossaryTerm[]>([]);
  const [editing, setEditing] = useState<Partial<GlossaryTerm> | null>(null);

  async function load() {
    const { data } = await supabase.from("glossary_terms").select("*").order("term");
    setList(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.term || !editing?.definition) { toast.show("Term and definition required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("glossary_terms").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("glossary_terms").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this term?")) return;
    const { error } = await supabase.from("glossary_terms").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Glossary</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" /> Add</Button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit term" : "New term"}</h2>
          <Input label="Term" value={editing.term || ""} onChange={(e) => setEditing({ ...editing, term: e.target.value })} />
          <Textarea label="Definition" value={editing.definition || ""} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Color (hex for avatar)" value={editing.color || "#623CEA"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
            <Input label="Order" type="number" value={editing.order_index ?? 0} onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <Checkbox label="Published" checked={editing.is_published ?? true}
            onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((g) => (
          <div key={g.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="w-10 h-10 text-white font-extrabold rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: g.color || "#623CEA" }}>
              {g.term[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm">{g.term}</span>
                {!g.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
              </div>
              <div className="text-xs text-muted mt-1 line-clamp-2">{g.definition}</div>
            </div>
            <button onClick={() => setEditing(g)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(g.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {list.length === 0 && <div className="text-muted text-sm">No terms yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
