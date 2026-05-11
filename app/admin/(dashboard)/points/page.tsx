"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Toast, useToast } from "@/components/admin/Form";
import type { PointRule } from "@/lib/types";
import { Coins, Save } from "lucide-react";

/**
 * Friendly labels + descriptions for each `point_rules.content_type`.
 * Keys must match the `content_type` strings seeded by
 * `supabase/migration_026_points_rules_and_transactions.sql`.
 */
const CONTENT_TYPE_META: Record<
  string,
  { label: string; helper: string }
> = {
  module: {
    label: "Module completed",
    helper: "Default XP a user earns for finishing a module (Learn).",
  },
  video: {
    label: "Video watched",
    helper: "Default XP for finishing a Watch video.",
  },
  news: {
    label: "News read",
    helper: "Default XP for reading a news item or article.",
  },
  apply_video: {
    label: "Apply video — Got it",
    helper: "Default XP when a user taps Got it on an Apply video.",
  },
  quiz_question: {
    label: "Quiz question — correct",
    helper: "Default XP per correct quiz answer (used by quizzes).",
  },
};

type Draft = Record<string, number>;

export default function PointsAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [rules, setRules] = useState<PointRule[]>([]);
  const [draft, setDraft] = useState<Draft>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("point_rules")
      .select("*")
      .order("content_type");
    if (error) {
      toast.show(error.message, "error");
      setLoading(false);
      return;
    }
    const list = (data || []) as PointRule[];
    setRules(list);
    setDraft(
      list.reduce<Draft>((acc, r) => {
        acc[r.id] = r.default_points;
        return acc;
      }, {}),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveRule(rule: PointRule) {
    const next = draft[rule.id];
    if (next == null || Number.isNaN(next) || next < 0) {
      toast.show("Points must be a non-negative number", "error");
      return;
    }
    if (next === rule.default_points) {
      toast.show("No changes", "error");
      return;
    }

    setSaving(rule.id);
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("point_rules")
      .update({
        default_points: next,
        updated_at: new Date().toISOString(),
        updated_by: userRes.user?.id ?? null,
      })
      .eq("id", rule.id);
    setSaving(null);

    if (error) {
      toast.show(error.message, "error");
      return;
    }
    toast.show("Saved");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center">
            <Coins size={20} className="text-amber" />
          </div>
          <h1 className="text-3xl font-extrabold">Points rules</h1>
        </div>
      </div>

      <p className="text-sm text-muted mb-6 max-w-2xl">
        Default XP awarded when a user completes each type of content. Per-item overrides on a
        specific module / video / news / apply video take priority — leave the item's{" "}
        <span className="font-mono text-shadow">points_award</span> field empty to fall back to
        these defaults.
      </p>

      {loading ? (
        <div className="text-muted text-sm">Loading rules…</div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-muted">
          No point rules found. Run migration{" "}
          <code className="bg-chiffon px-1.5 py-0.5 rounded text-xs">
            026_points_rules_and_transactions.sql
          </code>{" "}
          to seed defaults.
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => {
            const meta = CONTENT_TYPE_META[r.content_type] || {
              label: r.content_type,
              helper: "Custom content type.",
            };
            const value = draft[r.id] ?? r.default_points;
            const dirty = value !== r.default_points;
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-nborder"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-shadow text-sm">{meta.label}</span>
                      <code className="text-[10px] font-mono bg-chiffon text-muted px-1.5 py-0.5 rounded">
                        {r.content_type}
                      </code>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{meta.helper}</p>
                    {r.updated_at && (
                      <p className="text-[10px] text-muted mt-2">
                        Last updated{" "}
                        {new Date(r.updated_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    <label className="block">
                      <span className="block text-[10px] font-bold text-muted uppercase tracking-wide mb-1">
                        Default points
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={value}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [r.id]: parseInt(e.target.value, 10),
                          }))
                        }
                        className="w-28 bg-chiffon rounded-lg px-3 py-2.5 text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-amber"
                      />
                    </label>
                    <Button
                      onClick={() => saveRule(r)}
                      disabled={!dirty || saving === r.id}
                      className="!px-4"
                    >
                      <Save size={14} className="inline mr-1" />
                      {saving === r.id ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 bg-chiffon rounded-2xl p-5 text-xs text-muted leading-relaxed">
        <div className="font-bold text-shadow text-sm mb-2">How point overrides work</div>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Each module / video / news / apply video has its own{" "}
            <span className="font-mono">points_award</span> field on the edit form.
          </li>
          <li>
            If that field is empty, the user earns the default amount set here for the matching
            content type.
          </li>
          <li>
            Set <span className="font-mono">points_award = 0</span> on an item to award zero XP for
            that specific item only.
          </li>
        </ul>
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
