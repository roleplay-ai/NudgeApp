"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Button, Toast, useToast } from "@/components/admin/Form";
import type { HomeBriefHero } from "@/lib/types";

const DEFAULTS: Omit<HomeBriefHero, "id" | "updated_at"> = {
  badge_label: "NUDGEABLE BRIEF",
  title: "What changed in AI — fast",
  subtitle:
    "Three headlines worth your attention — curated, plain English, links when you want more.",
  byline_override: null,
  byline_suffix: "Nudgeable Editorial",
};

export default function BriefHeroAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [row, setRow] = useState<HomeBriefHero | null>(null);
  const [draft, setDraft] = useState<Partial<HomeBriefHero> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("home_brief_hero")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.show(error.message, "error");
      setLoading(false);
      return;
    }

    if (!data) {
      const { data: inserted, error: insErr } = await supabase
        .from("home_brief_hero")
        .insert({
          badge_label: DEFAULTS.badge_label,
          title: DEFAULTS.title,
          subtitle: DEFAULTS.subtitle,
          byline_suffix: DEFAULTS.byline_suffix,
          byline_override: null,
        })
        .select("*")
        .single();

      if (insErr) {
        toast.show(insErr.message, "error");
        setRow(null);
        setDraft(null);
        setLoading(false);
        return;
      }
      setRow(inserted as HomeBriefHero);
      setDraft(inserted as HomeBriefHero);
      setLoading(false);
      return;
    }

    setRow(data as HomeBriefHero);
    setDraft(data as HomeBriefHero);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!draft?.title?.trim() || !draft?.subtitle?.trim()) {
      toast.show("Title and subtitle are required", "error");
      return;
    }

    const payload = {
      badge_label: draft.badge_label?.trim() || DEFAULTS.badge_label,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      byline_suffix: draft.byline_suffix?.trim() || DEFAULTS.byline_suffix,
      byline_override: draft.byline_override?.trim() ? draft.byline_override.trim() : null,
    };

    if (draft.id) {
      const { error } = await supabase.from("home_brief_hero").update(payload).eq("id", draft.id);
      if (error) {
        toast.show(error.message, "error");
        return;
      }
    } else {
      const { error } = await supabase.from("home_brief_hero").insert(payload);
      if (error) {
        toast.show(error.message, "error");
        return;
      }
    }

    toast.show("Saved — Home hero updated");
    await load();
  }

  if (loading || !draft) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold mb-2">Brief hero</h1>
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Brief hero</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl leading-relaxed">
        Edits the dark card above the weekly headlines on Home. Leave{" "}
        <strong>Byline override</strong> empty to show{" "}
        <code className="text-xs bg-chiffon px-1 rounded">
          {"{latest news date} · {suffix}"}
        </code>
        .
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border border-black/5 max-w-2xl">
        <Input
          label="Badge label"
          value={draft.badge_label || ""}
          onChange={(e) => setDraft({ ...draft, badge_label: e.target.value })}
        />
        <Input
          label="Title"
          value={draft.title || ""}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Textarea
          label="Subtitle"
          value={draft.subtitle || ""}
          onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
          rows={3}
        />
        <Input
          label="Byline suffix (after date, when override is empty)"
          value={draft.byline_suffix || ""}
          onChange={(e) => setDraft({ ...draft, byline_suffix: e.target.value })}
        />
        <Textarea
          label="Byline override (optional — replaces date · suffix entirely)"
          value={draft.byline_override ?? ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              byline_override: e.target.value === "" ? null : e.target.value,
            })
          }
          rows={2}
        />
        <div className="flex gap-2 pt-2">
          <Button onClick={save}>Save</Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (row) setDraft({ ...row });
              else setDraft({ ...DEFAULTS, id: draft.id } as HomeBriefHero);
            }}
          >
            Revert
          </Button>
        </div>
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
