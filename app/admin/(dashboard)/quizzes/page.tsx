"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { Quiz } from "@/lib/types";
import { Trash2, Edit2, Plus, ChevronRight, Lock } from "lucide-react";

const empty = (): Partial<Quiz> => ({
  title: "",
  description: null,
  emoji: "🧠",
  color: "#623CEA",
  order_index: 0,
  is_published: false,
  is_locked: false,
  points_per_question: 10,
  completion_bonus: 0,
  time_per_question: 30,
});

export default function QuizzesAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<Quiz[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Partial<Quiz> | null>(null);

  async function load() {
    const { data: quizzes } = await supabase.from("quizzes").select("*").order("order_index");
    setList(quizzes || []);

    const { data: questions } = await supabase.from("quiz_questions").select("quiz_id");
    const counts: Record<string, number> = {};
    (questions || []).forEach((q: any) => {
      counts[q.quiz_id] = (counts[q.quiz_id] || 0) + 1;
    });
    setQuestionCounts(counts);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.title) { toast.show("Title is required", "error"); return; }
    const payload: any = { ...editing };
    if (editing.id) {
      const { error } = await supabase.from("quizzes").update(payload).eq("id", editing.id);
      if (error) toast.show(error.message, "error");
      else { toast.show("Saved"); setEditing(null); load(); }
    } else {
      const { error } = await supabase.from("quizzes").insert(payload);
      if (error) toast.show(error.message, "error");
      else { toast.show("Created"); setEditing(null); load(); }
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this quiz and all its questions?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  return (
    <div>
      <Toast message={toast.msg} type={toast.type} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Quizzes</h1>
        <Button onClick={() => setEditing(empty())}><Plus size={14} className="inline mr-1" />Add quiz</Button>
      </div>
      <p className="text-sm text-muted mb-6">
        Create MCQ quizzes for the Play page. Click into a quiz to manage its questions.
      </p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit quiz" : "New quiz"}</h2>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Emoji" value={editing.emoji || ""} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
            <Input label="Color (hex)" value={editing.color || "#623CEA"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
            <Input label="Order (lower = first)" type="number" value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="Title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Textarea label="Description (optional)" value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value || null })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Points per correct answer" type="number" value={editing.points_per_question ?? 10}
              onChange={(e) => setEditing({ ...editing, points_per_question: parseInt(e.target.value) || 0 })} />
            <Input label="Completion bonus pts" type="number" value={editing.completion_bonus ?? 0}
              onChange={(e) => setEditing({ ...editing, completion_bonus: parseInt(e.target.value) || 0 })} />
            <Select
              label="Seconds per question"
              options={["5", "10", "15", "20", "25", "30"]}
              value={String(editing.time_per_question ?? 30)}
              onChange={(e) => setEditing({ ...editing, time_per_question: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Checkbox label="Published (visible to users)" checked={editing.is_published ?? false}
              onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
            <Checkbox label="Locked (guests see padlock, must log in to play)" checked={editing.is_locked ?? false}
              onChange={(e) => setEditing({ ...editing, is_locked: e.target.checked })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl border border-nborder p-4 flex items-center gap-4">
            <span className="text-2xl">{quiz.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold truncate">{quiz.title}</span>
                {quiz.is_locked && <Lock size={12} className="text-muted shrink-0" />}
                {!quiz.is_published && (
                  <span className="text-[10px] font-bold bg-chiffon text-muted px-2 py-0.5 rounded-full">DRAFT</span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {questionCounts[quiz.id] ?? 0} question{questionCounts[quiz.id] === 1 ? "" : "s"} ·{" "}
                {quiz.points_per_question} pts/q{quiz.completion_bonus > 0 ? ` · +${quiz.completion_bonus} bonus` : ""}{" "}
                · ⏱ {quiz.time_per_question}s/question
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/admin/quizzes/${quiz.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-shadow border border-nborder px-3 py-1.5 rounded-full hover:bg-chiffon transition">
                Questions <ChevronRight size={12} />
              </Link>
              <button type="button" onClick={() => setEditing({ ...quiz })}
                className="p-2 rounded-full hover:bg-chiffon transition text-muted">
                <Edit2 size={14} />
              </button>
              <button type="button" onClick={() => remove(quiz.id)}
                className="p-2 rounded-full hover:bg-fuchsia/10 transition text-fuchsia">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && !editing && (
          <p className="text-sm text-muted text-center py-10">No quizzes yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
