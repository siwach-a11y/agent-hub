"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function DailyDealsAgent() {
  return (
    <RewardsAgentView
      type="daily-deal"
      icon="📅"
      actionLabel="View Deal"
      intro="Fresh deals every day that reset at midnight. Grab today's picks across electronics, dining, travel, and fashion before the clock runs out."
      chat={{
        title: "Daily Deals AI Assistant",
        placeholder: "Ask about today's best deals...",
        quickAsks: [
          "What's the best deal today?",
          "Is the Breville deal a good price?",
          "Any dining deals for lunch?",
        ],
        systemContext:
          "You are a deal expert for AgentHub's Daily Deals Agent, surfacing the strongest limited-time daily deals and judging whether each is genuinely worth it.",
      }}
    />
  );
}
