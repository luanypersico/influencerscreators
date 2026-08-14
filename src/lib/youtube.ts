// Extracts and validates only a YouTube video ID from a URL — never
// interpolates raw admin input into markup. The ID is the only thing that
// ever reaches an iframe src, always via youtube-nocookie.com.

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ALLOWED_HOSTS = new Set(["youtube.com", "youtube-nocookie.com", "youtu.be", "m.youtube.com"]);

export function extractYouTubeVideoId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (!ALLOWED_HOSTS.has(host)) return null;

  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.slice(1).split("/")[0] || null;
  } else if (url.pathname.startsWith("/watch")) {
    candidate = url.searchParams.get("v");
  } else if (url.pathname.startsWith("/embed/")) {
    candidate = url.pathname.slice("/embed/".length).split("/")[0] || null;
  } else if (url.pathname.startsWith("/shorts/")) {
    candidate = url.pathname.slice("/shorts/".length).split("/")[0] || null;
  }

  if (!candidate || !YOUTUBE_ID_PATTERN.test(candidate)) return null;
  return candidate;
}

/** youtube-nocookie embed URL, or null when the input isn't a recognizable YouTube video URL — never renders a broken/empty player. */
export function buildYouTubeEmbedUrl(rawUrl: string): string | null {
  const id = extractYouTubeVideoId(rawUrl);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
