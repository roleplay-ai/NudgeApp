"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { PracticeActivity, PracticeRubric } from "@/lib/types";
import { Trash2, Edit2, Plus, ChevronDown, ChevronUp, GripVertical, Lock } from "lucide-react";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const CATEGORY_OPTIONS = [
  "Prompt Engineering",
  "Data Analytics",
  "Text Generation",
  "Web Search",
  "Presentation",
  "Image Generation",
  "Everyday Productivity",
  "Document Search",
];

const DEFAULT_ASSESSMENT_PROMPT = `You are an expert prompt engineering assessor. Review the conversation between a user and an AI assistant and score the user's prompt engineering skills.

For each rubric criterion provided, give a score and a 1-2 sentence feedback. Be honest but constructive.

Return ONLY valid JSON in this exact format:
{
  "scores": [
    {
      "rubric_id": "<rubric id>",
      "score": <number>,
      "feedback": "<feedback text>"
    }
  ]
}

Do not include any text outside the JSON.`;

function emptyActivity(): Partial<PracticeActivity> {
  return {
    name: "",
    description: "",
    category: "Prompt Engineering",
    difficulty: "Medium",
    time_minutes: 15,
    xp_reward: 60,
    icon: "✦",
    color: "#7C3AED",
    assessment_prompt: DEFAULT_ASSESSMENT_PROMPT,
    hint_chips: ["Set a clear goal in one sentence", "Specify the output format", "List the constraints"],
    is_published: false,
    is_locked: false,
    order_index: 0,
  };
}

function emptyRubric(): Partial<PracticeRubric> {
  return { name: "", description: "", max_score: 25 };
}

export default function PracticeAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [activities, setActivities] = useState<PracticeActivity[]>([]);
  const [editing, setEditing] = useState<Partial<PracticeActivity> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Rubrics per activity
  const [rubricsByActivity, setRubricsByActivity] = useState<Record<string, PracticeRubric[]>>({});
  const [editingRubric, setEditingRubric] = useState<(Partial<PracticeRubric> & { activityId: string }) | null>(null);

  // Hint chips editing (comma separated)
  const [hintChipsStr, setHintChipsStr] = useState("");

  async function load() {
    const { data } = await supabase
      .from("practice_activities")
      .select("*")
      .order("order_index");
    setActivities((data as PracticeActivity[]) || []);
  }

  async function loadRubrics(activityId: string) {
    const { data } = await supabase
      .from("practice_rubrics")
      .select("*")
      .eq("activity_id", activityId)
      .order("created_at");
    setRubricsByActivity((prev) => ({ ...prev, [activityId]: (data as PracticeRubric[]) || [] }));
  }

  useEffect(() => { load(); }, []);

  function startEdit(activity?: Partial<PracticeActivity>) {
    const a = activity ?? emptyActivity();
    setEditing(a);
    setHintChipsStr((a.hint_chips || []).join(", "));
  }

  async function save() {
    if (!editing?.name) { toast.show("Name is required", "error"); return; }
    const chips = hintChipsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload: any = { ...editing, hint_chips: chips };
    delete payload.practice_rubrics;

    if (editing.id) {
      const { error } = await supabase.from("practice_activities").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("practice_activities").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this activity and all its rubrics and sessions?")) return;
    const { error } = await supabase.from("practice_activities").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!rubricsByActivity[id]) loadRubrics(id);
    }
  }

  async function saveRubric() {
    if (!editingRubric?.name) { toast.show("Rubric name required", "error"); return; }
    const { activityId, ...payload } = editingRubric as any;
    if (payload.id) {
      const { error } = await supabase.from("practice_rubrics").update(payload).eq("id", payload.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Rubric saved"); setEditingRubric(null); loadRubrics(activityId); }
    } else {
      const { error } = await supabase.from("practice_rubrics").insert({ ...payload, activity_id: activityId });
      if (error) toast.show(error.message, "error");
      else { toast.show("Rubric added"); setEditingRubric(null); loadRubrics(activityId); }
    }
  }

  async function removeRubric(rubricId: string, activityId: string) {
    if (!confirm("Delete this rubric criterion?")) return;
    const { error } = await supabase.from("practice_rubrics").delete().eq("id", rubricId);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); loadRubrics(activityId); }
  }

  return (
    <div>
      <Toast message={toast.msg} type={toast.type} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Practice Activities</h1>
        <Button onClick={() => startEdit()}><Plus size={14} className="inline mr-1" />Add activity</Button>
      </div>
      <p className="text-sm text-muted mb-6">
        Create prompt-engineering practice activities. Each activity has rubric criteria that the AI uses to score users&apos; conversations.
      </p>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit activity" : "New activity"}</h2>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input label="Category" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              placeholder="e.g. Prompt Engineering" />
          </div>

          <Textarea label="Description / The Brief (what the user is solving)"
            value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })} />

          <div className="grid grid-cols-4 gap-3">
            <Select label="Difficulty" options={DIFFICULTY_OPTIONS}
              value={editing.difficulty || "Medium"}
              onChange={(e) => setEditing({ ...editing, difficulty: e.target.value as any })} />
            <Input label="Time (minutes)" type="number" value={editing.time_minutes ?? 15}
              onChange={(e) => setEditing({ ...editing, time_minutes: parseInt(e.target.value) || 15 })} />
            <Input label="XP reward" type="number" value={editing.xp_reward ?? 60}
              onChange={(e) => setEditing({ ...editing, xp_reward: parseInt(e.target.value) || 0 })} />
            <Input label="Order index" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Icon (emoji or short text)" value={editing.icon || "✦"}
              onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
            <Input label="Card color (hex)" value={editing.color || "#7C3AED"}
              onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
          </div>

          <Input label="Hint chips (comma-separated, shown above chat input)"
            value={hintChipsStr}
            onChange={(e) => setHintChipsStr(e.target.value)}
            placeholder="Set a clear goal, Specify output format, List constraints" />

          <Textarea label="Assessment prompt (system prompt used to evaluate user conversation)"
            value={editing.assessment_prompt || DEFAULT_ASSESSMENT_PROMPT}
            onChange={(e) => setEditing({ ...editing, assessment_prompt: e.target.value })}
            rows={10} />

          <div className="flex gap-6">
            <Checkbox label="Published (visible to users)"
              checked={editing.is_published ?? false}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <Checkbox label="Locked (login required to start)"
              checked={editing.is_locked ?? false}
              onChange={(e) => setEditing({ ...editing, is_locked: e.target.checked })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Activities list */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl border border-nborder overflow-hidden">
            {/* Activity row */}
            <div className="p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: activity.color }}
              >
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold truncate">{activity.name}</span>
                  {!activity.is_published && (
                    <span className="text-[10px] font-bold bg-chiffon text-muted px-2 py-0.5 rounded-full">DRAFT</span>
                  )}
                  {activity.is_locked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-shadow/5 text-muted px-2 py-0.5 rounded-full border border-shadow/10">
                      <Lock size={9} strokeWidth={3} /> LOCKED
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {activity.category} · {activity.difficulty} · {activity.time_minutes} min · +{activity.xp_reward} XP
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleExpand(activity.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-shadow border border-nborder px-3 py-1.5 rounded-full hover:bg-chiffon transition"
                >
                  Rubrics {expandedId === activity.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <button type="button" onClick={() => startEdit({ ...activity })}
                  className="p-2 rounded-full hover:bg-chiffon transition text-muted">
                  <Edit2 size={14} />
                </button>
                <button type="button" onClick={() => remove(activity.id)}
                  className="p-2 rounded-full hover:bg-fuchsia/10 transition text-fuchsia">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Rubrics panel */}
            {expandedId === activity.id && (
              <div className="border-t border-nborder bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Rubric criteria</span>
                  <Button onClick={() => setEditingRubric({ ...emptyRubric(), activityId: activity.id } as any)}>
                    <Plus size={12} className="inline mr-1" />Add criterion
                  </Button>
                </div>

                {/* Rubric edit form */}
                {editingRubric?.activityId === activity.id && (
                  <div className="bg-white rounded-xl p-4 border-2 border-amber space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Input label="Criterion name (e.g. Prompt clarity)"
                          value={editingRubric.name || ""}
                          onChange={(e) => setEditingRubric({ ...editingRubric, name: e.target.value })} />
                      </div>
                      <Input label="Max score" type="number" value={editingRubric.max_score ?? 25}
                        onChange={(e) => setEditingRubric({ ...editingRubric, max_score: parseInt(e.target.value) || 25 })} />
                    </div>
                    <Textarea label="Description (shown to users as grading criteria)"
                      value={editingRubric.description || ""}
                      onChange={(e) => setEditingRubric({ ...editingRubric, description: e.target.value })} />
                    <div className="flex gap-2">
                      <Button onClick={saveRubric}>Save criterion</Button>
                      <Button variant="ghost" onClick={() => setEditingRubric(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Rubric list */}
                <div className="space-y-2">
                  {(rubricsByActivity[activity.id] || []).map((rubric) => (
                    <div key={rubric.id} className="bg-white rounded-lg border border-nborder p-3 flex items-start gap-3">
                      <GripVertical size={14} className="text-muted mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{rubric.name} <span className="text-muted font-normal">/{rubric.max_score}</span></div>
                        {rubric.description && <div className="text-xs text-muted mt-0.5">{rubric.description}</div>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button type="button"
                          onClick={() => setEditingRubric({ ...rubric, activityId: activity.id })}
                          className="p-1.5 rounded-full hover:bg-chiffon transition text-muted">
                          <Edit2 size={12} />
                        </button>
                        <button type="button"
                          onClick={() => removeRubric(rubric.id, activity.id)}
                          className="p-1.5 rounded-full hover:bg-fuchsia/10 transition text-fuchsia">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(rubricsByActivity[activity.id] || []).length === 0 && !editingRubric && (
                    <p className="text-xs text-muted text-center py-4">No rubric criteria yet. Add one above.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {activities.length === 0 && !editing && (
          <p className="text-sm text-muted text-center py-10">No practice activities yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
