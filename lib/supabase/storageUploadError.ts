/** User-facing hint when Storage bucket `content` is missing (Supabase returns Bucket not found). */
export function storageUploadErrorMessage(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes("bucket") && (t.includes("not found") || t.includes("does not exist"))) {
    return [
      raw,
      "",
      'Create the Storage bucket named "content" (public).',
      "Easiest: Supabase → SQL Editor → run supabase/migration_006_storage_content_bucket.sql",
      "Or: Storage → New bucket → Bucket ID content → enable Public bucket.",
    ].join("\n");
  }
  return raw;
}
