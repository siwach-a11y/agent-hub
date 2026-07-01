"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function PromoCodeAgent() {
  return (
    <RewardsAgentView
      type="promo-code"
      icon="🏷️"
      actionLabel="Copy & Shop"
      intro="Verified promo codes ready to paste at checkout. Filter by category or brand and grab the code — the discount and minimum spend are shown on each offer."
      chat={{
        title: "Promo Code AI Assistant",
        placeholder: "Ask about promo codes and stacking rules...",
        quickAsks: [
          "Best code for a first order?",
          "Which codes work with free delivery?",
          "Any sitewide fashion codes?",
        ],
        systemContext:
          "You are a promo-code expert for AgentHub's Promo Code Agent, helping users find valid codes, understand terms, and stack them where allowed.",
      }}
    />
  );
}
