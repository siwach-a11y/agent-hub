"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function LoyaltyRewardsAgent() {
  return (
    <RewardsAgentView
      type="loyalty"
      icon="🎁"
      actionLabel="Redeem Points"
      intro="Turn loyalty points and miles into real value. Browse redemptions across coffee, beauty, travel, and groceries — each shows the points needed and what it's worth."
      chat={{
        title: "Loyalty Rewards AI Assistant",
        placeholder: "Ask how to get the most from your points...",
        quickAsks: [
          "Best value redemption for my points?",
          "How many Stars for a free drink?",
          "Should I redeem points for flights or vouchers?",
        ],
        systemContext:
          "You are a loyalty-program expert for AgentHub's Loyalty Rewards Agent, helping users maximize the value of points and miles across programs.",
      }}
    />
  );
}
