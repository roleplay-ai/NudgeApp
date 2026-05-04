/** Convert common YouTube watch/short/share URLs to embed path for iframe src. */
export function youtubeEmbedSrc(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  try {
    const parsed = new URL(u.startsWith("http") ? u : `https://${u}`);
    const host = parsed.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") {
      id = parsed.pathname.replace(/^\//, "").split("/")[0] || null;
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      id = parsed.searchParams.get("v");
      if (!id && parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.replace(/^\/embed\//, "").split("/")[0] || null;
      }
      if (!id && parsed.pathname.startsWith("/shorts/")) {
        id = parsed.pathname.replace(/^\/shorts\//, "").split("/")[0] || null;
      }
    }
    if (!id || !/^[a-zA-Z0-9_-]{6,}$/.test(id)) return null;
    return `https://www.youtube.com/embed/${id}?rel=0`;
  } catch {
    return null;
  }
}
