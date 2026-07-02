"use client";

import { useEffect, useState } from "react";
import { DiscoveredOffer } from "@/lib/pipeline/types";
import ResultCard from "@/components/ui/ResultCard";

const ICON: Record<string, string> = {
  voucher: "🎟️",
  "daily-deal": "📅",
  cashback: "💵",
  "promo-code": "🏷️",
  loyalty: "🎁",
  bogo: "🛍️",
  "flash-sale": "🔥",
};

/**
 * Live offers published through the operator pipeline. Fetches /api/offers/published
 * (server deploy only); renders nothing on the static demo where the API is absent.
 */
export default function PublishedOffers() {
  const [offers, setOffers] = useState<DiscoveredOffer[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/offers/published")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.offers) setOffers(data.offers as DiscoveredOffer[]);
      })
      .catch(() => {
        /* no backend (static demo) — stay hidden */
      });
    return () => {
      active = false;
    };
  }, []);

  if (offers.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="section-title mb-1">Freshly discovered</p>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Live Offers
            <span className="ml-2 text-base font-normal text-slate-400">
              {offers.length}
            </span>
          </h2>
        </div>
        <span className="badge-pill bg-hub-green-light/90 text-hub-green border-transparent">
          Pipeline
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((o) => (
          <ResultCard
            key={o.id}
            icon={ICON[o.rewardType] ?? "🎁"}
            title={o.title}
            subtitle={`${o.merchant}${o.country ? ` · ${o.country}` : ""}`}
            price={o.discountText ?? "Offer"}
            meta={[
              o.category,
              ...(o.promoCode ? [`Code: ${o.promoCode}`] : []),
              "Verified source",
            ]}
            availability="available"
            actionLabel="View Offer"
            onAction={() => window.open(o.url, "_blank")}
          />
        ))}
      </div>
    </section>
  );
}
