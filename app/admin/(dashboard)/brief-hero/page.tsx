"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Button, Toast, useToast } from "@/components/admin/Form";
import type { HomeBriefHero } from "@/lib/types";
import RichText from "@/components/ui/RichText";

const DEFAULTS: Omit<HomeBriefHero, "id" | "updated_at"> = {
  badge_label: "NUDGEABLE BRIEF",
  title: "What changed in AI — fast",
  subtitle:
    "Three headlines worth your attention — curated, plain English, links when you want more.",
  byline_override: null,
  byline_suffix: "Nudgeable Editorial",
};

// ── Toolbar button inserts formatting around selection ──────────────────
function insertFormat(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
  setValue: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const next =
    textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
  setValue(next);
  // Re-focus and select the inserted content
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
  });
}

function insertBullet(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void
) {
  const pos = textarea.selectionStart;
  const val = textarea.value;
  // Find start of current line
  const lineStart = val.lastIndexOf("\n", pos - 1) + 1;
  const lineText = val.slice(lineStart, pos);
  const hasBullet = /^[-*]\s/.test(lineText);
  let next: string;
  if (hasBullet) {
    // Remove bullet
    next = val.slice(0, lineStart) + lineText.replace(/^[-*]\s/, "") + val.slice(pos);
  } else {
    // Insert bullet at line start or add a new bullet line
    const atLineStart = pos === lineStart || lineText.trim() === "";
    if (atLineStart) {
      next = val.slice(0, lineStart) + "- " + val.slice(lineStart);
    } else {
      next = val.slice(0, pos) + "\n- " + val.slice(pos);
    }
  }
  setValue(next);
  requestAnimationFrame(() => textarea.focus());
}

export default function BriefHeroAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [row, setRow] = useState<HomeBriefHero | null>(null);
  const [draft, setDraft] = useState<Partial<HomeBriefHero> | null>(null);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => { load(); }, []);

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
      if (error) { toast.show(error.message, "error"); return; }
    } else {
      const { error } = await supabase.from("home_brief_hero").insert(payload);
      if (error) { toast.show(error.message, "error"); return; }
    }

    toast.show("Saved — Home hero updated");
    await load();
  }

  function setSubtitle(v: string) {
    setDraft((d) => d ? { ...d, subtitle: v } : d);
  }

  if (loading || !draft) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold mb-2">Brief hero</h1>
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const subtitle = draft.subtitle || "";

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Brief hero</h1>
      <p className="text-sm text-muted mb-6 max-w-2xl leading-relaxed">
        Edits the dark card above the weekly headlines on Home. The subtitle supports rich
        formatting — use the toolbar or type Markdown syntax directly.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start max-w-5xl">
        {/* ── Editor ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border border-black/5">
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

          {/* Subtitle with toolbar */}
          <div>
            <label className="block text-xs font-semibold text-shadow mb-1.5">
              Subtitle{" "}
              <span className="font-normal text-muted">(supports rich text)</span>
            </label>

            {/* Toolbar */}
            <div className="flex gap-1 mb-1.5 flex-wrap">
              {[
                {
                  label: <span className="font-bold text-[13px]">B</span>,
                  title: "Bold — **text**",
                  action: () =>
                    textareaRef.current &&
                    insertFormat(textareaRef.current, "**", "**", "bold text", setSubtitle),
                },
                {
                  label: <span className="italic text-[13px]">I</span>,
                  title: "Italic — *text*",
                  action: () =>
                    textareaRef.current &&
                    insertFormat(textareaRef.current, "*", "*", "italic text", setSubtitle),
                },
                {
                  label: <span className="font-mono text-[12px]">` `</span>,
                  title: "Inline code — `code`",
                  action: () =>
                    textareaRef.current &&
                    insertFormat(textareaRef.current, "`", "`", "code", setSubtitle),
                },
                {
                  label: <span className="text-[13px]">— List</span>,
                  title: "Bullet list — starts line with -",
                  action: () =>
                    textareaRef.current && insertBullet(textareaRef.current, setSubtitle),
                },
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  title={btn.title}
                  onClick={btn.action}
                  className="px-3 py-1.5 rounded-lg bg-chiffon border border-nborder text-shadow hover:bg-amber/20 transition text-xs font-semibold"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-nborder bg-chiffon/50 px-4 py-3 text-sm text-shadow font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber/60 resize-y"
              placeholder={"Three headlines worth your attention.\n\n- **Curated** daily\n- Plain *English*\n- Links when you want more"}
            />

            {/* Syntax cheatsheet */}
            <div className="mt-2 px-3 py-2.5 rounded-lg bg-chiffon/60 border border-nborder text-[11px] text-muted leading-relaxed space-y-0.5">
              <div><code className="font-mono">**bold**</code> → <strong>bold</strong></div>
              <div><code className="font-mono">*italic*</code> → <em>italic</em></div>
              <div><code className="font-mono">`code`</code> → inline highlight</div>
              <div><code className="font-mono">- item</code> → bullet point (blank line between paragraphs)</div>
            </div>
          </div>

          <Input
            label="Byline suffix (shown after date)"
            value={draft.byline_suffix || ""}
            onChange={(e) => setDraft({ ...draft, byline_suffix: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-shadow mb-1.5">
              Byline override{" "}
              <span className="font-normal text-muted">(optional — replaces date entirely)</span>
            </label>
            <input
              value={draft.byline_override ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, byline_override: e.target.value === "" ? null : e.target.value })
              }
              className="w-full rounded-xl border border-nborder bg-chiffon/50 px-4 py-2.5 text-sm text-shadow focus:outline-none focus:ring-2 focus:ring-amber/40"
              placeholder="e.g. May 2026 · Nudgeable Editorial"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save changes</Button>
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

        {/* ── Live preview ── */}
        <div className="lg:sticky lg:top-6">
          <div className="text-[10px] font-bold tracking-[0.15em] text-muted mb-2 uppercase">
            Live preview
          </div>
          <div
            className="rounded-2xl border border-black/10 shadow-md overflow-hidden px-5 pt-6 pb-6 md:px-8 md:pt-8 md:pb-7"
            style={{ background: "#1c1814" }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-md bg-homeClay text-white">
                {draft.badge_label || DEFAULTS.badge_label}
              </span>
              <span className="text-[12px] text-homeWarmGray">
                {draft.byline_override?.trim() || "May 6, 2026"}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight">
              {draft.title || DEFAULTS.title}
            </h2>
            <RichText
              content={subtitle || DEFAULTS.subtitle}
              classes={{
                wrapper: "mt-3 max-w-2xl space-y-2",
                p: "text-sm text-homeWarmGray leading-relaxed",
                ul: "space-y-1.5 list-none",
                li: "flex items-start gap-2 text-sm text-homeWarmGray leading-relaxed",
                bullet: "shrink-0 text-homeClay mt-0.5 text-base leading-none",
                strong: "font-bold text-white",
                em: "italic",
                code: "font-mono text-[12px] bg-white/10 text-amber px-1.5 py-0.5 rounded",
              }}
            />
          </div>
          <p className="text-[11px] text-muted mt-2 text-center">
            Reflects exactly what users see on the home page
          </p>
        </div>
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
