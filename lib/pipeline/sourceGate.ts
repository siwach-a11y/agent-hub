import { domainOf } from "./urlCanon";

// Scored source gate — a TS port of Fando's official_source scoring. Instead of
// a binary allow/block, we score each discovered offer's trustworthiness and
// admit those clearing a threshold. Higher score = more trustworthy merchant.

/** Known/reputable voucher & retail merchant domains, by country ("GLOBAL" applies everywhere). */
const KNOWN_MERCHANT_DOMAINS: Record<string, string[]> = {
  GLOBAL: [
    "amazon.", "nike.com", "adidas.com", "sephora.com", "uniqlo.com", "asos.com",
    "booking.com", "agoda.com", "starbucks.com", "dominos.", "thebodyshop.com",
    "samsung.com", "apple.com", "bestbuy.com", "marriott.com",
  ],
  TH: [
    "lazada.co.th", "shopee.co.th", "central.co.th", "grab.com", "foodpanda.co.th",
    "tescolotus.com", "bigc.co.th", "aeon.co.th", "cafe-amazon.com", "majorcineplex.com",
  ],
  SG: ["lazada.sg", "shopee.sg", "fairprice.com.sg", "grab.com", "klook.com"],
  MY: ["lazada.com.my", "shopee.com.my", "grab.com", "watsons.com.my"],
  GB: ["tesco.com", "sainsburys.co.uk", "argos.co.uk", "boots.com", "asos.com"],
  US: ["amazon.com", "target.com", "walmart.com", "bestbuy.com", "cvs.com"],
  IN: ["amazon.in", "flipkart.com", "myntra.com", "swiggy.com", "zomato.com"],
};

const POSITIVE_PHRASES = [
  "official", "% off", "percent off", "promo code", "coupon", "voucher",
  "cashback", "cash back", "deal", "discount", "buy 1 get 1", "bogo", "flash sale",
];

/** Hard-reject spammy/scam signals in the title (Fando's amateur-reject analog). */
const REJECT_PHRASES = [
  "free money", "click here now", "get rich", "casino", "crypto giveaway",
  "work from home", "make $$$", "hot singles", "adult",
];

const MIN_SCORE = 3;

export interface ScoreInput {
  title: string;
  merchant: string;
  url: string;
  sourceUrl: string;
  discountText?: string;
  promoCode?: string;
  country: string;
}

export interface ScoreResult {
  score: number;
  passed: boolean;
  reasons: string[];
}

function domainKnown(domain: string, country: string): boolean {
  if (!domain) return false;
  const lists = [KNOWN_MERCHANT_DOMAINS.GLOBAL, KNOWN_MERCHANT_DOMAINS[country] ?? []];
  return lists.some((list) => list.some((d) => domain.includes(d) || d.includes(domain)));
}

export function scoreOffer(input: ScoreInput): ScoreResult {
  const reasons: string[] = [];
  const title = (input.title ?? "").toLowerCase();
  const hay = `${title} ${(input.merchant ?? "").toLowerCase()}`;

  // Hard rejects.
  for (const bad of REJECT_PHRASES) {
    if (title.includes(bad)) {
      return { score: 0, passed: false, reasons: [`reject:${bad}`] };
    }
  }

  let score = 0;
  const redeemDomain = domainOf(input.url);
  const sourceDomain = domainOf(input.sourceUrl);

  if (domainKnown(redeemDomain, input.country)) {
    score += 6;
    reasons.push(`known_merchant:${redeemDomain}`);
  } else if (domainKnown(sourceDomain, input.country)) {
    score += 3;
    reasons.push(`known_source:${sourceDomain}`);
  }

  let phraseHits = 0;
  for (const p of POSITIVE_PHRASES) {
    if (hay.includes(p) && phraseHits < 4) {
      score += 1;
      phraseHits++;
      reasons.push(`signal:${p}`);
    }
  }

  if (input.promoCode) {
    score += 1;
    reasons.push("has_code");
  }
  if (input.discountText) {
    score += 1;
    reasons.push("has_value");
  }
  if (redeemDomain) {
    score += 1;
    reasons.push("has_redeem_url");
  }

  return { score, passed: score >= MIN_SCORE, reasons };
}

export const GATE_MIN_SCORE = MIN_SCORE;
