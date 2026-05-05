"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { Module, World } from "@/lib/types";
import { Trash2, Edit2, Plus, ArrowLeft, ChevronRight } from "lucide-react";

const empty = (world_id: string): Partial<Module> => ({
  world_id, slug: "", title: "", concepts: [], xp_reward: 10, order_index: 0, is_published: false,
});

export default function WorldDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();
  const toast = useToast();
  const [world, setWorld] = useState<World | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [screenCounts, setScreenCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Partial<Module> | null>(null);
  const [conceptInput, setConceptInput] = useState("");

  async function load() {
    const [{ data: w }, { data: m }] = await Promise.all([
      supabase.from("worlds").select("*").eq("id", id).single(),
      supabase.from("modules").select("*").eq("world_id", id).order("order_index"),
    ]);
    setWorld(w);
    setModules(m || []);

    if (m && m.length) {
      const ids = m.map((mod: any) => mod.id);
      const { data: screens } = await supabase.from("module_screens").select("module_id").in("module_id", ids);
      const counts: Record<string, number> = {};
      (screens || []).forEach((s: any) => {
        counts[s.module_id] = (counts[s.module_id] || 0) + 1;
      });
      setScreenCounts(counts);
    }
  }
  useEffect(() => { load(); }, [id]);

  function addConcept() {
    if (!conceptInput.trim() || !editing) return;
    setEditing({ ...editing, concepts: [...(editing.concepts || []), conceptInput.trim()] });
    setConceptInput("");
  }
  function removeConcept(i: number) {
    if (!editing) return;
    const arr = [...(editing.concepts || [])];
    arr.splice(i, 1);
    setEditing({ ...editing, concepts: arr });
  }

  async function save() {
    if (!editing?.title || !editing?.slug) { toast.show("Title and slug required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("modules").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("modules").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(moduleId: string) {
    if (!confirm("Delete this module and all its screens?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <Link href="/admin/worlds" className="text-xs text-muted flex items-center gap-1 mb-3">
        <ArrowLeft size={12} /> Back to worlds
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{world?.emoji}</span>
        <h1 className="text-3xl font-extrabold">{world?.title}</h1>
        <span className="text-muted text-sm font-mono">{world?.slug}</span>
      </div>
      <p className="text-muted text-sm mb-6">{world?.description}</p>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Modules ({modules.length})</h2>
        <Button onClick={() => setEditing(empty(id))}><Plus size={14} className="inline mr-1" /> Add module</Button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h3 className="font-bold">{editing.id ? "Edit module" : "New module"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" value={editing.title || ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Input label="Slug (e.g. m1.1)" value={editing.slug || ""}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </div>

          <div>
            <span className="block text-xs font-semibold text-shadow mb-1">Concepts (shown on Unlocked screen)</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editing.concepts || []).map((c, i) => (
                <span key={i} className="bg-chiffon px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  {c}
                  <button type="button" onClick={() => removeConcept(i)} className="text-fuchsia">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={conceptInput} onChange={(e) => setConceptInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addConcept(); } }}
                placeholder="Type a concept and press Enter"
                className="flex-1 bg-chiffon rounded-lg px-3 py-2 text-sm outline-none" />
              <Button variant="ghost" onClick={addConcept}>Add</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="XP reward" type="number" value={editing.xp_reward ?? 10}
              onChange={(e) => setEditing({ ...editing, xp_reward: parseInt(e.target.value) || 10 })} />
            <Input label="Order" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <Checkbox label="Published" checked={editing.is_published ?? false}
            onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {modules.map((m) => (
          <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-center">
            <div className="w-8 h-8 bg-norange text-white font-extrabold text-xs rounded-lg flex items-center justify-center flex-shrink-0">
              {m.order_index}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm">{m.title}</span>
                <span className="text-[10px] font-mono text-muted">{m.slug}</span>
                {!m.is_published && <span className="text-[10px] font-bold bg-muted text-white px-2 py-0.5 rounded-full">DRAFT</span>}
              </div>
              <div className="text-[10px] text-muted">
                {screenCounts[m.id] || 0} screens · {m.xp_reward} XP
              </div>
            </div>
            <Link href={`/admin/worlds/${id}/modules/${m.id}`} className="text-xs font-semibold text-shadow flex items-center gap-1">
              Screens <ChevronRight size={14} />
            </Link>
            <button onClick={() => setEditing(m)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(m.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {modules.length === 0 && <div className="text-muted text-sm">No modules yet.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
