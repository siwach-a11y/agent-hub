"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function BuyOneGetOneAgent() {
  return (
    <RewardsAgentView
      type="bogo"
      icon="🛍️"
      actionLabel="Claim BOGO"
      intro="Buy-one-get-one offers across food, entertainment, and beauty. Perfect for sharing — filter by category or brand and claim before the offer ends."
      chat={{
        title: "Buy 1 Get 1 AI Assistant",
        placeholder: "Ask about the best BOGO offers...",
        quickAsks: [
          "Best BOGO food deals today?",
          "Any 2-for-1 movie tickets?",
          "Which BOGO offers need a membership?",
        ],
        systemContext:
          "You are a buy-one-get-one deals expert for AgentHub's Buy 1 Get 1 Agent, helping users find and make the most of BOGO offers.",
      }}
    />
  );
}
