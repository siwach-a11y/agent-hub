"use client";

import { useState, useMemo } from "react";
import { RewardOffer, RewardType } from "@/lib/types";
import {
  getOffersByType,
  rewardCategories,
  formatOfferEnds,
} from "@/lib/data/rewards";
import ResultCard from "@/components/ui/ResultCard";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";

interface RewardsAgentViewProps {
  type: RewardType;
  icon: string;
  /** Contextual banner shown above the filters. */
  intro: string;
  actionLabel: string;
  chat: {
    title: string;
    placeholder: string;
    quickAsks: string[];
    systemContext: string;
  };
}

/** Short value badge shown on each card, tailored to the reward type. */
function primaryValue(offer: RewardOffer): string {
  if (offer.type === "cashback" && offer.cashbackPercent != null)
    return `${offer.cashbackPercent}% back`;
  if (offer.type === "loyalty" && offer.pointsRequired != null)
    return `${offer.pointsRequired.toLocaleString()} pts`;
  if (offer.salePrice != null) return `$${offer.salePrice}`;
  if (offer.discountPercent != null) return `${offer.discountPercent}% off`;
  return "Reward";
}

function metaFor(offer: RewardOffer): string[] {
  const meta: string[] = [offer.category];

  if (offer.type === "cashback" && offer.cashbackPercent != null) {
    meta.push(`${offer.cashbackPercent}% cashback`);
  } else if (offer.type === "loyalty") {
    if (offer.pointsValue) meta.push(offer.pointsValue);
  } else if (offer.type === "promo-code" && offer.promoCode) {
    meta.push(`Code: ${offer.promoCode}`);
  } else if (offer.type === "bogo" && offer.bogoDetail) {
    meta.push(offer.bogoDetail);
  } else if (offer.discountPercent != null) {
    meta.push(`${offer.discountPercent}% off`);
  }

  if (offer.minSpend) meta.push(`Min $${offer.minSpend}`);
  meta.push(`Ends ${formatOfferEnds(offer.endsAt)}`);
  return meta;
}

export default function RewardsAgentView({
  type,
  icon,
  intro,
  actionLabel,
  chat,
}: RewardsAgentViewProps) {
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { response, isLoading, ask } = useAIResponse();

  const offers = useMemo(() => getOffersByType(type), [type]);

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      if (category !== "All" && o.category !== category) return false;
      if (featuredOnly && !o.featured) return false;
      if (brand) {
        const q = brand.toLowerCase();
        if (
          !o.brand.toLowerCase().includes(q) &&
          !o.title.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [offers, category, brand, featuredOnly]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-3.5 text-sm text-hub-teal bg-white/90 border border-white shadow-sm">
        {intro}
      </div>

      <div className="glass-panel p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-modern"
          >
            {rewardCategories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Brand or keyword"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="input-modern"
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 px-1">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-hub-blue focus:ring-hub-blue"
            />
            Featured only
          </label>
          <button
            onClick={() => {
              setIsSearching(true);
              setTimeout(() => setIsSearching(false), 400);
            }}
            className="btn-primary"
          >
            {actionLabel}
          </button>
        </div>
        <StatusBar
          status={isSearching ? "thinking" : "idle"}
          message={`${filtered.length} offers found`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((o) => (
          <ResultCard
            key={o.id}
            icon={icon}
            title={o.title}
            subtitle={`${o.brand}${o.city ? ` · ${o.city}` : ""}`}
            price={primaryValue(o)}
            meta={metaFor(o)}
            availability={o.availability}
            actionLabel={actionLabel}
            onAction={() => window.open(o.url, "_blank")}
            onDetails={() =>
              ask(
                `Explain this ${type.replace("-", " ")} offer and whether it's worth using: "${o.title}" from ${o.brand}. ${o.description}${
                  o.promoCode ? ` Promo code: ${o.promoCode}.` : ""
                }${o.minSpend ? ` Minimum spend $${o.minSpend}.` : ""} Ends ${formatOfferEnds(o.endsAt)}.`
              )
            }
            onAlternatives={() =>
              ask(
                `Find similar ${o.category} ${type.replace("-", " ")} offers${o.city ? ` in ${o.city}` : ""} that are as good or better than ${o.brand}'s "${o.title}".`
              )
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">No offers match your filters.</div>
      )}

      {response && (
        <div className="glass-panel p-5">
          <StatusBar status={isLoading ? "thinking" : "idle"} />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">
            {response}
          </p>
        </div>
      )}

      <AIChat
        title={chat.title}
        placeholder={chat.placeholder}
        quickAsks={chat.quickAsks}
        systemContext={chat.systemContext}
      />
    </div>
  );
}
