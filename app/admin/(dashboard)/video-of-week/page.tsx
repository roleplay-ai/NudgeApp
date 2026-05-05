"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Toast, useToast } from "@/components/admin/Form";
import type { HomeWeeklyWatchVideo, WatchVideo } from "@/lib/types";

const selectClass =
  "w-full bg-chiffon rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber";

type Slot = 1 | 2 | 3 | 4;

export default function VideoOfWeekAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [watchVideos, setWatchVideos] = useState<WatchVideo[]>([]);
  const [rows, setRows] = useState<HomeWeeklyWatchVideo[]>([]);
  const [saving, setSaving] = useState(false);

  // slot -> watch_video_id
  const [picks, setPicks] = useState<Record<Slot, string>>({
    1: "",
    2: "",
    3: "",
    4: "",
  });

  async function loadWatchVideos() {
    const { data, error } = await supabase.from("watch_videos").select("*").order("order_index");
    if (error) toast.show(error.message, "error");
    setWatchVideos((data || []) as WatchVideo[]);
  }

  async function loadPicks() {
    const { data, error } = await supabase
      .from("home_weekly_watch_videos")
      .select("*")
      .order("slot", { ascending: true });
    if (error) toast.show(error.message, "error");
    const list = (data || []) as HomeWeeklyWatchVideo[];
    setRows(list);

    const next: Record<Slot, string> = { 1: "", 2: "", 3: "", 4: "" };
    for (const r of list) {
      const slot = Number(r.slot) as Slot;
      if (slot >= 1 && slot <= 4) next[slot] = r.watch_video_id;
    }
    setPicks(next);
  }

  useEffect(() => {
    loadWatchVideos();
    loadPicks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickedIds = useMemo(() => Object.values(picks).filter(Boolean), [picks]);
  const hasDuplicates = useMemo(() => new Set(pickedIds).size !== pickedIds.length, [pickedIds]);
  const isComplete = useMemo(() => pickedIds.length === 4 && !hasDuplicates, [pickedIds.length, hasDuplicates]);

  const byId = useMemo(() => new Map(watchVideos.map((v) => [v.id, v])), [watchVideos]);

  function setSlot(slot: Slot, id: string) {
    setPicks((p) => ({ ...p, [slot]: id }));
  }

  async function save() {
    if (hasDuplicates) {
      toast.show("Pick 4 different videos (no duplicates).", "error");
      return;
    }
    if (!isComplete) {
      toast.show("Pick all 4 slots before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      // delete all existing rows, then insert the 4 picks
      const del = await supabase.from("home_weekly_watch_videos").delete().neq("slot", 0);
      if (del.error) {
        toast.show(del.error.message, "error");
        return;
      }

      const payload = (Object.entries(picks) as Array<[string, string]>).map(([slot, watch_video_id]) => ({
        slot: Number(slot),
        watch_video_id,
      }));

      const ins = await supabase.from("home_weekly_watch_videos").insert(payload);
      if (ins.error) {
        toast.show(ins.error.message, "error");
        return;
      }

      toast.show("Saved — Home ‘Watch this week’ updated");
      loadPicks();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Video of the week</h1>
        <Button onClick={save} disabled={saving || !isComplete}>
          {saving ? "Saving…" : "Save picks"}
        </Button>
      </div>

      <p className="text-sm text-muted mb-6 max-w-2xl leading-relaxed">
        Pick <strong>exactly 4</strong> videos from your <strong>Watch</strong> library to show on Home under{" "}
        <strong>Watch this week</strong>. Slots control display order.
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border border-black/5 max-w-3xl">
        {[1, 2, 3, 4].map((s) => {
          const slot = s as Slot;
          const id = picks[slot];
          const v = id ? byId.get(id) : null;
          return (
            <div key={slot} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3 items-start">
              <div className="text-xs font-bold text-shadow pt-2">SLOT {slot}</div>
              <div className="space-y-2">
                <select className={selectClass} value={id} onChange={(e) => setSlot(slot, e.target.value)}>
                  <option value="">— Choose a video —</option>
                  {watchVideos.map((wv) => (
                    <option key={wv.id} value={wv.id}>
                      {wv.title} — {wv.creator}
                      {!wv.is_published ? " (draft)" : ""}
                    </option>
                  ))}
                </select>
                {v ? (
                  <div className="text-xs text-muted">
                    <div className="font-semibold text-shadow line-clamp-1">{v.title}</div>
                    <div className="text-muted">
                      {v.creator}
                      {v.duration ? ` · ${v.duration}` : ""}
                      {!v.is_published ? " · draft" : ""}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {hasDuplicates ? (
          <div className="text-xs font-semibold text-fuchsia">Duplicates detected — choose 4 different videos.</div>
        ) : null}

        <div className="text-xs text-muted">
          Currently saved rows: <strong>{rows.length}</strong>
        </div>
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}

