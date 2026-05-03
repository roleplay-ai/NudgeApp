"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X } from "lucide-react";

export default function ImageUploader({
  value,
  onChange,
  folder = "general",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("content").upload(path, file);
    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      const { data } = supabase.storage.from("content").getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="max-w-full h-32 rounded-lg border border-nborder" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 bg-fuchsia text-white rounded-full w-6 h-6 flex items-center justify-center">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-2 bg-chiffon px-4 py-2.5 rounded-lg cursor-pointer text-sm font-semibold">
          <Upload size={14} />
          {uploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/*" onChange={upload} className="hidden" disabled={uploading} />
        </label>
      )}
    </div>
  );
}
