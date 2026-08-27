export type YouTubeRef = { id: string; start?: number };

const ID = /^[A-Za-z0-9_-]{11}$/;

/** Seconds from a YouTube time param: "44", "44s", "1m30s", "1h2m3s". */
function parseStart(raw: string | null): number | undefined {
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m || (!m[1] && !m[2] && !m[3])) return undefined;
  const secs = Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
  return secs || undefined;
}

/** Accepts any ordinary YouTube URL, or a bare 11-character video id. */
export function parseYouTube(input: string): YouTubeRef | null {
  const raw = input.trim();
  if (!raw) return null;
  if (ID.test(raw)) return { id: raw };

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host.endsWith("youtube.com")) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (m) id = m[1];
    }
  }

  if (!id || !ID.test(id)) return null;
  const start = parseStart(url.searchParams.get("t") || url.searchParams.get("start"));
  return start ? { id, start } : { id };
}
