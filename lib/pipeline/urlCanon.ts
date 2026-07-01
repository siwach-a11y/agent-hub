// Canonical URL handling for dedupe — a TS port of Fando's url_canon/dedup:
// normalize early to a stable key so the same offer from different link forms
// collapses to one queue entry.

/** Stable dedupe key: host (no www) + path, lowercased, no query/trailing slash. */
export function canonicalizeUrl(raw: string): string {
  const trimmed = (raw ?? "").trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/, "");
    return `${host}${path}`;
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, "");
  }
}

/** Bare registrable-ish domain, e.g. "grab.com" from a full URL. */
export function domainOf(raw: string): string {
  try {
    return new URL((raw ?? "").trim()).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Drop offers whose canonical URL repeats within the batch (keeps first). */
export function dedupeByCanonicalUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = canonicalizeUrl(item.url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
