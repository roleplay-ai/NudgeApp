"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { storageUploadErrorMessage } from "@/lib/supabase/storageUploadError";
import { formatFileSize, probeVideoDurationFromFile } from "@/lib/videoDuration";
import { Upload, X, Film, Loader2 } from "lucide-react";

export type VideoUploaderMeta = { duration?: string };

export default function VideoUploader({
  value,
  onChange,
  folder = "apply-videos",
}: {
  value: string | null;
  onChange: (url: string | null, meta?: VideoUploaderMeta) => void;
  folder?: string;
}) {
  type Phase = null | "reading" | "uploading";
  const [phase, setPhase] = useState<Phase>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const supabase = createClient();

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const input = e.currentTarget;
    if (!file) return;

    setPendingLabel(`${file.name} · ${formatFileSize(file.size)}`);
    setPhase("reading");

    let durationFormatted: string | null = null;
    try {
      durationFormatted = await probeVideoDurationFromFile(file);
    } catch {
      durationFormatted = null;
    }

    setPhase("uploading");

    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("content").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    setPhase(null);
    setPendingLabel(null);
    input.value = "";

    if (error) {
      alert("Upload failed:\n\n" + storageUploadErrorMessage(error.message));
      return;
    }

    const { data } = supabase.storage.from("content").getPublicUrl(path);
    const meta: VideoUploaderMeta | undefined =
      durationFormatted != null && durationFormatted !== ""
        ? { duration: durationFormatted }
        : undefined;
    onChange(data.publicUrl, meta);
  }

  const filename = value ? decodeURIComponent(value.split("/").pop() || "") : null;

  if (phase !== null) {
    return (
      <div className="rounded-xl border-2 border-dashed border-nborder bg-chiffon py-8 px-4 flex flex-col items-center gap-4 pointer-events-none select-none">
        <Loader2 className="w-9 h-9 text-norange animate-spin flex-shrink-0" aria-hidden />
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-shadow" role="status" aria-live="polite">
            {phase === "reading" ? "Reading video…" : "Uploading to storage…"}
          </div>
          <div className="text-[10px] text-muted max-w-[280px] truncate mx-auto">{pendingLabel}</div>
          <div className="text-[10px] text-muted">
            {phase === "reading" ? "Detecting length from file" : "Keep this tab open"}
          </div>
        </div>
        <div className="w-full max-w-[220px] h-2 rounded-full bg-nborder/50 overflow-hidden">
          <div className="h-full w-[65%] bg-amber rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-3 bg-chiffon rounded-xl px-4 py-3">
          <Film size={18} className="text-norange flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-shadow truncate">{filename}</div>
            <div className="text-[10px] text-muted">Video uploaded</div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-fuchsia hover:opacity-70 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 bg-chiffon border-2 border-dashed border-nborder rounded-xl py-6 cursor-pointer hover:border-amber transition">
          <Upload size={20} className="text-muted" />
          <span className="text-sm font-semibold text-shadow">Upload video</span>
          <span className="text-[10px] text-muted">MP4, MOV, or WebM · max 500MB</span>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            onChange={upload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
