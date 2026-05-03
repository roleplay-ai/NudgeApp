/**
 * Resolve a watchable thumbnail: explicit DB URL wins; otherwise derive from known hosts (YouTube).
 */

const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

function tryParseUrl(raw: string): URL | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    return new URL(s);
  } catch {
    try {
      return new URL(`https://${s}`);
    } catch {
      return null;
    }
  }
}

/** Extract YouTube video id from common URL shapes. */
export function extractYouTubeVideoId(videoUrl: string | null | undefined): string | null {
  if (!videoUrl) return null;
  const url = tryParseUrl(videoUrl);
  if (!url) return null;

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return YT_ID.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && YT_ID.test(v)) return v;

    const segs = url.pathname.split("/").filter(Boolean);
    const kind = segs[0];
    const id = segs[1];
    if ((kind === "embed" || kind === "shorts" || kind === "v" || kind === "live") && id && YT_ID.test(id)) {
      return id;
    }
  }

  return null;
}

function youTubeThumbnailUrl(videoId: string, quality: "hqdefault" | "maxresdefault" = "hqdefault"): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Prefer stored thumbnail_url; if empty, derive from video url (YouTube).
 */
export function resolveVideoThumbnailUrl(
  thumbnailUrl: string | null | undefined,
  videoUrl: string | null | undefined
): string | null {
  const trimmed = thumbnailUrl?.trim();
  if (trimmed) return trimmed;

  const yt = extractYouTubeVideoId(videoUrl ?? undefined);
  if (yt) return youTubeThumbnailUrl(yt);

  return null;
}
