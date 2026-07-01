"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function FlashSaleAgent() {
  return (
    <RewardsAgentView
      type="flash-sale"
      icon="🔥"
      actionLabel="Grab Now"
      intro="Time-boxed flash sales at their deepest discounts. Stock is limited and windows are short — act fast on electronics, travel, fashion, and beauty drops."
      chat={{
        title: "Flash Sale AI Assistant",
        placeholder: "Ask about live flash sales...",
        quickAsks: [
          "Which flash sale ends soonest?",
          "Is the Samsung TV flash price good?",
          "Any flash fares to Singapore?",
        ],
        systemContext:
          "You are a flash-sale expert for AgentHub's Flash Sale Agent, helping users spot the best limited-time drops and decide fast whether to buy.",
      }}
    />
  );
}
