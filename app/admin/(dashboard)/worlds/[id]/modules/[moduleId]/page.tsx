"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Button, Toast, useToast } from "@/components/admin/Form";
import type { ModuleScreen, Module } from "@/lib/types";
import { Trash2, Edit2, Plus, ArrowLeft, X } from "lucide-react";

const TYPES = ["hook", "idea", "example", "why", "check", "unlocked"];
const TONES = ["neutral", "good", "bad"];
const TOKEN_STYLES = ["normal", "highlight", "dimmed"];

type EditingScreen = Partial<ModuleScreen> & {
  _options: Array<{ option_text: string; is_correct: boolean }>;
  _tokens: Array<{ token_text: string; style: "normal" | "highlight" | "dimmed" }>;
};

function emptyEditing(module_id: string): EditingScreen {
  return {
    module_id, screen_type: "hook", label: "", title: "", body: "", tone: "neutral",
    question: "", feedback_correct: "", feedback_incorrect: "", next_module_title: "", order_index: 0,
    _options: [],
    _tokens: [],
  };
}

export default function ModuleDetail({ params }: { params: { id: string; moduleId: string } }) {
  const { id, moduleId } = params;
  const supabase = createClient();
  const toast = useToast();
  const [mod, setMod] = useState<Module | null>(null);
  const [screens, setScreens] = useState<ModuleScreen[]>([]);
  const [editing, setEditing] = useState<EditingScreen | null>(null);

  async function load() {
    const [{ data: m }, { data: s }] = await Promise.all([
      supabase.from("modules").select("*").eq("id", moduleId).single(),
      supabase.from("module_screens")
        .select("*, screen_options(*), screen_tokens(*)")
        .eq("module_id", moduleId)
        .order("order_index"),
    ]);
    setMod(m);
    setScreens(s || []);
  }
  useEffect(() => { load(); }, [moduleId]);

  function startEditing(screen: ModuleScreen) {
    const opts = (screen.screen_options || []).sort((a, b) => a.order_index - b.order_index);
    const tokens = (screen.screen_tokens || []).sort((a, b) => a.order_index - b.order_index);
    setEditing({
      ...screen,
      _options: opts.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })),
      _tokens: tokens.map((t) => ({ token_text: t.token_text, style: t.style })),
    });
  }

  async function save() {
    if (!editing?.screen_type) { toast.show("Type required", "error"); return; }
    const { _options, _tokens, screen_options, screen_tokens, ...payload } = editing as any;

    let screenId = editing.id;

    if (screenId) {
      const { error } = await supabase.from("module_screens").update(payload).eq("id", screenId);
      if (error) { toast.show(error.message, "error"); return; }
    } else {
      const { data, error } = await supabase.from("module_screens").insert(payload).select().single();
      if (error) { toast.show(error.message, "error"); return; }
      screenId = data.id;
    }

    if (editing.screen_type === "check") {
      await supabase.from("screen_options").delete().eq("screen_id", screenId);
      if (_options.length) {
        await supabase.from("screen_options").insert(
          _options.map((o: any, i: number) => ({ screen_id: screenId, option_text: o.option_text, is_correct: o.is_correct, order_index: i }))
        );
      }
    }

    if (editing.screen_type === "example") {
      await supabase.from("screen_tokens").delete().eq("screen_id", screenId);
      if (_tokens.length) {
        await supabase.from("screen_tokens").insert(
          _tokens.map((t: any, i: number) => ({ screen_id: screenId, token_text: t.token_text, style: t.style, order_index: i }))
        );
      }
    }

    toast.show(editing.id ? "Saved" : "Created");
    setEditing(null);
    load();
  }

  async function remove(screenId: string) {
    if (!confirm("Delete this screen?")) return;
    const { error } = await supabase.from("module_screens").delete().eq("id", screenId);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  function addOption() {
    if (!editing) return;
    setEditing({ ...editing, _options: [...editing._options, { option_text: "", is_correct: false }] });
  }
  function setCorrectOption(i: number) {
    if (!editing) return;
    setEditing({ ...editing, _options: editing._options.map((o, idx) => ({ ...o, is_correct: idx === i })) });
  }
  function updateOption(i: number, val: string) {
    if (!editing) return;
    const arr = [...editing._options];
    arr[i] = { ...arr[i], option_text: val };
    setEditing({ ...editing, _options: arr });
  }
  function removeOption(i: number) {
    if (!editing) return;
    const arr = [...editing._options];
    arr.splice(i, 1);
    setEditing({ ...editing, _options: arr });
  }

  function addToken() {
    if (!editing) return;
    setEditing({ ...editing, _tokens: [...editing._tokens, { token_text: "", style: "normal" as const }] });
  }
  function updateToken(i: number, patch: Partial<{ token_text: string; style: "normal" | "highlight" | "dimmed" }>) {
    if (!editing) return;
    const arr = [...editing._tokens];
    arr[i] = { ...arr[i], ...patch };
    setEditing({ ...editing, _tokens: arr });
  }
  function removeToken(i: number) {
    if (!editing) return;
    const arr = [...editing._tokens];
    arr.splice(i, 1);
    setEditing({ ...editing, _tokens: arr });
  }

  const t = editing?.screen_type;

  return (
    <div>
      <Link href={`/admin/worlds/${id}`} className="text-xs text-muted flex items-center gap-1 mb-3">
        <ArrowLeft size={12} /> Back to world
      </Link>
      <h1 className="text-3xl font-extrabold mb-6">{mod?.title || "Module"}</h1>

      <div className="bg-chiffon rounded-xl p-4 mb-6 text-xs text-shadow leading-relaxed">
        <b>6-screen flow:</b> hook → idea → example → why → check → unlocked.
        Add them in this order. Each module needs all 6 to feel right.
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Screens ({screens.length} / 6)</h2>
        <Button onClick={() => setEditing(emptyEditing(moduleId))}><Plus size={14} className="inline mr-1" /> Add screen</Button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h3 className="font-bold">{editing.id ? "Edit screen" : "New screen"}</h3>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Type" value={editing.screen_type || "hook"} options={TYPES}
              onChange={(e) => setEditing({ ...editing, screen_type: e.target.value as any })} />
            <Input label="Order" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
            <Input label="Label (e.g., HOOK)" value={editing.label || ""}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
          </div>

          {(t === "hook" || t === "idea" || t === "why") && (
            <>
              <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Textarea label="Body" value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            </>
          )}

          {t === "example" && (
            <>
              <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Textarea label="Body" value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              <Select label="Tone" value={editing.tone || "neutral"} options={TONES}
                onChange={(e) => setEditing({ ...editing, tone: e.target.value as any })} />
              <div>
                <span className="block text-xs font-semibold text-shadow mb-2">Tokens (highlighted words, optional)</span>
                <div className="space-y-2">
                  {editing._tokens.map((tk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={tk.style} onChange={(e) => updateToken(i, { style: e.target.value as any })}
                        className="bg-chiffon rounded-lg px-2 py-2 text-sm outline-none">
                        {TOKEN_STYLES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <input value={tk.token_text} onChange={(e) => updateToken(i, { token_text: e.target.value })}
                        placeholder="Token text"
                        className="flex-1 bg-chiffon rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber" />
                      <button onClick={() => removeToken(i)} className="text-fuchsia"><X size={14} /></button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={addToken} className="mt-2">+ Add token</Button>
              </div>
            </>
          )}

          {t === "check" && (
            <>
              <Textarea label="Question" value={editing.question || ""} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
              <div>
                <span className="block text-xs font-semibold text-shadow mb-2">Options (click radio for correct)</span>
                <div className="space-y-2">
                  {editing._options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" checked={o.is_correct}
                        onChange={() => setCorrectOption(i)}
                        className="w-4 h-4 accent-emerald" />
                      <input value={o.option_text} onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-chiffon rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber" />
                      {editing._options.length > 2 && (
                        <button onClick={() => removeOption(i)} className="text-fuchsia"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" onClick={addOption}>+ Add option</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Textarea label="Feedback (correct)" value={editing.feedback_correct || ""}
                  onChange={(e) => setEditing({ ...editing, feedback_correct: e.target.value })} />
                <Textarea label="Feedback (incorrect)" value={editing.feedback_incorrect || ""}
                  onChange={(e) => setEditing({ ...editing, feedback_incorrect: e.target.value })} />
              </div>
            </>
          )}

          {t === "unlocked" && (
            <>
              <Input label="Title (default: 'Module complete')" value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <Input label="Body (default: 'You now understand')" value={editing.body || ""}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              <Input label="Next module title (optional)" value={editing.next_module_title || ""}
                onChange={(e) => setEditing({ ...editing, next_module_title: e.target.value })} />
              <p className="text-xs text-muted">Concepts come from the module itself, not this screen.</p>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {screens.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="w-8 h-8 bg-shadow text-amber font-extrabold text-xs rounded-lg flex items-center justify-center flex-shrink-0">
              {s.order_index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold bg-nblue text-white px-2 py-0.5 rounded-full">{s.screen_type}</span>
                {s.tone && s.screen_type === "example" && (
                  <span className="text-[10px] font-bold bg-chiffon px-2 py-0.5 rounded-full capitalize">{s.tone}</span>
                )}
                {s.title && <span className="font-bold text-sm">{s.title}</span>}
                {s.question && <span className="font-bold text-sm">{s.question.slice(0, 40)}…</span>}
              </div>
              {s.body && <div className="text-xs text-muted line-clamp-2">{s.body}</div>}
              {s.screen_type === "check" && (
                <div className="text-[10px] text-muted mt-1">{s.screen_options?.length || 0} options</div>
              )}
              {s.screen_type === "example" && (
                <div className="text-[10px] text-muted mt-1">{s.screen_tokens?.length || 0} tokens</div>
              )}
            </div>
            <button onClick={() => startEditing(s)} className="text-muted hover:text-shadow"><Edit2 size={16} /></button>
            <button onClick={() => remove(s.id)} className="text-fuchsia hover:opacity-70"><Trash2 size={16} /></button>
          </div>
        ))}
        {screens.length === 0 && <div className="text-muted text-sm">No screens yet. Aim for 6.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
