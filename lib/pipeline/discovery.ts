import { getAnthropicClient } from "@/lib/anthropic";
import { RewardCategory, RewardType } from "@/lib/types";
import { DiscoveredOffer } from "./types";
import { getProfile } from "./profiles";
import { scoreOffer } from "./sourceGate";
import { canonicalizeUrl, dedupeByCanonicalUrl } from "./urlCanon";

const MODEL = "claude-opus-4-5";

export interface DiscoveryRequest {
  rewardType: RewardType;
  category: RewardCategory;
  country: string; // ISO alpha-2 or country name
  now: string; // ISO timestamp, passed in (Date.now is unavailable in some runtimes)
}

interface RawOffer {
  title?: string;
  merchant?: string;
  description?: string;
  discountText?: string;
  promoCode?: string;
  url?: string;
  sourceUrl?: string;
}

/** Extract a JSON array from the model's text (handles code fences / prose). */
function extractJsonArray(text: string): RawOffer[] {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Run discovery for one (rewardType, category, country) and return gated, deduped offers. */
export async function runDiscovery(req: DiscoveryRequest): Promise<DiscoveredOffer[]> {
  const profile = getProfile(req.rewardType);
  const client = getAnthropicClient();

  const prompt = `You are the discovery agent for a Voucher & Rewards marketplace.
Use web search to find CURRENT, real ${profile.hint} in the "${req.category}" category available in ${req.country}.
Return up to ${profile.itemsTarget} offers as a JSON array ONLY (no prose), each object with:
- "title": short offer title
- "merchant": brand/store name
- "description": one sentence
- "discountText": human value e.g. "20% off", "Buy 1 Get 1 Free", "8% cashback"
- "promoCode": code if any, else omit
- "url": the redeem/landing URL
- "sourceUrl": the page you found it on
Only include offers from reputable merchants or well-known deal sites. Prefer offers valid in ${req.country}. Output the JSON array and nothing else.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
  });

  const text = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n");

  const raw = extractJsonArray(text);

  const built: DiscoveredOffer[] = [];
  for (const r of raw) {
    if (!r.title || !r.url) continue;
    const scored = scoreOffer({
      title: r.title,
      merchant: r.merchant ?? "",
      url: r.url,
      sourceUrl: r.sourceUrl ?? "",
      discountText: r.discountText,
      promoCode: r.promoCode,
      country: req.country,
    });
    if (!scored.passed) continue;

    built.push({
      id: canonicalizeUrl(r.url),
      rewardType: req.rewardType,
      title: r.title.trim(),
      merchant: (r.merchant ?? "").trim(),
      category: req.category,
      country: req.country,
      description: (r.description ?? "").trim(),
      discountText: r.discountText?.trim(),
      promoCode: r.promoCode?.trim(),
      url: r.url.trim(),
      sourceUrl: (r.sourceUrl ?? "").trim(),
      score: scored.score,
      status: "pending_approval",
      discoveredAt: req.now,
      notes: scored.reasons.join(", "),
    });
  }

  return dedupeByCanonicalUrl(built);
}
