/**
 * Accepts an ordinary Instagram address, with or without a scheme, and returns
 * it normalised to an absolute https:// URL — or null if it is not Instagram.
 *
 * The normalising half is the point, not a nicety. Editors paste addresses
 * copied from a browser's address bar, which routinely arrive without a
 * scheme ("instagram.com/reel/..."). Stored raw and rendered as an href that
 * is a RELATIVE path, so the link would resolve against ntulifoundation.org
 * and 404 rather than going to Instagram. Returning an absolute URL here means
 * whatever Phase 3 puts in `embed.url` is always safe to use as an href.
 */
export function parseInstagram(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");
  if (host !== "instagram.com" && !host.endsWith(".instagram.com")) return null;

  url.protocol = "https:";
  return url.toString();
}
