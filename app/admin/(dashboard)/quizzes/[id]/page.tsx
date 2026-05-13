"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Button, Toast, useToast } from "@/components/admin/Form";
import type { Quiz, QuizQuestion, QuizOption } from "@/lib/types";
import { ArrowLeft, Edit2, Plus, Trash2, X, Check } from "lucide-react";

type EditingQuestion = Partial<QuizQuestion> & {
  _options: Array<{ option_text: string; is_correct: boolean }>;
};

function emptyQuestion(quiz_id: string): EditingQuestion {
  return {
    quiz_id,
    question: "",
    feedback_correct: "Correct!",
    feedback_incorrect: "Not quite — the correct answer is highlighted above.",
    order_index: 0,
    points_award: null,
    _options: [
      { option_text: "", is_correct: true },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  };
}

export default function QuizDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();
  const toast = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editing, setEditing] = useState<EditingQuestion | null>(null);

  async function load() {
    const [{ data: q }, { data: qs }] = await Promise.all([
      supabase.from("quizzes").select("*").eq("id", id).single(),
      supabase
        .from("quiz_questions")
        .select("*, quiz_options(*)")
        .eq("quiz_id", id)
        .order("order_index"),
    ]);
    setQuiz(q);
    setQuestions(
      (qs || []).map((question: QuizQuestion) => ({
        ...question,
        quiz_options: (question.quiz_options || []).sort((a, b) => a.order_index - b.order_index),
      }))
    );
  }

  useEffect(() => { load(); }, [id]);

  function startEditing(question: QuizQuestion) {
    const opts = (question.quiz_options || []).sort((a, b) => a.order_index - b.order_index);
    setEditing({
      ...question,
      _options: opts.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })),
    });
  }

  async function save() {
    if (!editing?.question?.trim()) { toast.show("Question text required", "error"); return; }
    const validOptions = editing._options.filter((o) => o.option_text.trim());
    if (validOptions.length < 2) { toast.show("At least 2 options required", "error"); return; }
    const hasCorrect = editing._options.some((o) => o.is_correct && o.option_text.trim());
    if (!hasCorrect) { toast.show("Mark at least one option as correct", "error"); return; }

    const { _options, quiz_options, ...payload } = editing as any;

    let questionId = editing.id;
    if (questionId) {
      const { error } = await supabase.from("quiz_questions").update(payload).eq("id", questionId);
      if (error) { toast.show(error.message, "error"); return; }
    } else {
      const { data, error } = await supabase.from("quiz_questions").insert(payload).select().single();
      if (error) { toast.show(error.message, "error"); return; }
      questionId = data.id;
    }

    // Replace options
    await supabase.from("quiz_options").delete().eq("question_id", questionId);
    const opts = validOptions.map((o, i) => ({
      question_id: questionId,
      option_text: o.option_text.trim(),
      is_correct: o.is_correct,
      order_index: i,
    }));
    const { error: optsError } = await supabase.from("quiz_options").insert(opts);
    if (optsError) { toast.show(optsError.message, "error"); return; }

    toast.show(editing.id ? "Saved" : "Created");
    setEditing(null);
    load();
  }

  async function remove(questionId: string) {
    if (!confirm("Delete this question?")) return;
    const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  function setOptionText(i: number, text: string) {
    if (!editing) return;
    const next = [...editing._options];
    next[i] = { ...next[i], option_text: text };
    setEditing({ ...editing, _options: next });
  }

  function setOptionCorrect(i: number) {
    if (!editing) return;
    // Only one correct answer
    const next = editing._options.map((o, idx) => ({ ...o, is_correct: idx === i }));
    setEditing({ ...editing, _options: next });
  }

  function addOption() {
    if (!editing) return;
    if (editing._options.length >= 6) { toast.show("Max 6 options", "error"); return; }
    setEditing({ ...editing, _options: [...editing._options, { option_text: "", is_correct: false }] });
  }

  function removeOption(i: number) {
    if (!editing) return;
    if (editing._options.length <= 2) { toast.show("Minimum 2 options", "error"); return; }
    const next = editing._options.filter((_, idx) => idx !== i);
    // Ensure at least one correct if we removed the correct one
    if (!next.some((o) => o.is_correct)) next[0].is_correct = true;
    setEditing({ ...editing, _options: next });
  }

  return (
    <div>
      <Toast message={toast.msg} type={toast.type} />
      <div className="flex items-center gap-3 mb-1">
        <Link href="/admin/quizzes" className="flex items-center gap-1 text-sm text-muted hover:text-shadow transition">
          <ArrowLeft size={14} /> Quizzes
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">
            {quiz ? `${quiz.emoji} ${quiz.title}` : "Quiz questions"}
          </h1>
          {quiz && (
            <p className="text-xs text-muted mt-0.5">
              {quiz.points_per_question} pts/correct · {quiz.completion_bonus} completion bonus
            </p>
          )}
        </div>
        <Button onClick={() => setEditing(emptyQuestion(id))}>
          <Plus size={14} className="inline mr-1" />Add question
        </Button>
      </div>

      {questions.length >= 30 && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium bg-amber/10 text-shadow border border-amber/30">
          Maximum of 30 questions reached.
        </div>
      )}

      {/* Editor panel */}
      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{editing.id ? "Edit question" : "New question"}</h2>
            <button type="button" onClick={() => setEditing(null)} className="p-1 text-muted hover:text-shadow">
              <X size={16} />
            </button>
          </div>

          <Textarea
            label="Question"
            value={editing.question || ""}
            onChange={(e) => setEditing({ ...editing, question: e.target.value })}
          />

          {/* Answer options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-shadow">Answer options (tick the correct one)</span>
              <button type="button" onClick={addOption} className="text-xs text-amber font-semibold hover:underline flex items-center gap-1">
                <Plus size={11} /> Add option
              </button>
            </div>
            <div className="space-y-2">
              {editing._options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOptionCorrect(i)}
                    title="Mark as correct"
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition"
                    style={opt.is_correct
                      ? { background: "#23CE6B", borderColor: "#23CE6B" }
                      : { background: "transparent", borderColor: "rgba(34,29,35,0.2)" }}
                  >
                    {opt.is_correct && <Check size={12} color="#fff" strokeWidth={3} />}
                  </button>
                  <input
                    className="flex-1 bg-chiffon rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt.option_text}
                    onChange={(e) => setOptionText(i, e.target.value)}
                  />
                  <button type="button" onClick={() => removeOption(i)} className="p-1 text-muted hover:text-fuchsia transition">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Feedback (correct)"
              value={editing.feedback_correct || ""}
              onChange={(e) => setEditing({ ...editing, feedback_correct: e.target.value })}
            />
            <Input
              label="Feedback (incorrect)"
              value={editing.feedback_incorrect || ""}
              onChange={(e) => setEditing({ ...editing, feedback_incorrect: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Order (lower = first)"
              type="number"
              value={editing.order_index ?? 0}
              onChange={(e) => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Points override (blank = quiz default)"
              type="number"
              placeholder={`default: ${quiz?.points_per_question ?? 10}`}
              value={editing.points_award ?? ""}
              onChange={(e) => setEditing({
                ...editing,
                points_award: e.target.value === "" ? null : parseInt(e.target.value) || 0,
              })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save question</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Question list */}
      <div className="space-y-3">
        {questions.map((question, idx) => {
          const correctOpt = question.quiz_options?.find((o) => o.is_correct);
          return (
            <div key={question.id} className="bg-white rounded-xl border border-nborder p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-black text-muted tabular-nums w-6 pt-0.5 shrink-0">Q{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-shadow mb-2 leading-snug">{question.question}</p>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {(question.quiz_options || []).map((opt) => (
                      <span
                        key={opt.id}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={opt.is_correct
                          ? { background: "#EDFBF3", color: "#0A6632", border: "1px solid #23CE6B50" }
                          : { background: "#F5F3F0", color: "#7A6B5E", border: "1px solid rgba(34,29,35,0.10)" }
                        }
                      >
                        {opt.is_correct && "✓ "}{opt.option_text}
                      </span>
                    ))}
                  </div>
                  {question.points_award !== null && (
                    <span className="text-[10px] text-muted">
                      {question.points_award} pts (override)
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button type="button" onClick={() => startEditing(question)}
                    className="p-2 rounded-full hover:bg-chiffon transition text-muted">
                    <Edit2 size={13} />
                  </button>
                  <button type="button" onClick={() => remove(question.id!)}
                    className="p-2 rounded-full hover:bg-fuchsia/10 transition text-fuchsia">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {questions.length === 0 && !editing && (
          <p className="text-sm text-muted text-center py-10">No questions yet. Add one above.</p>
        )}
      </div>

      {questions.length > 0 && (
        <p className="text-xs text-muted mt-4 text-right">{questions.length}/30 questions</p>
      )}
    </div>
  );
}
