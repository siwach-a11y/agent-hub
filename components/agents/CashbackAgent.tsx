"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function CashbackAgent() {
  return (
    <RewardsAgentView
      type="cashback"
      icon="💵"
      actionLabel="Activate Cashback"
      intro="Earn money back on everyday spend. Activate cashback offers on groceries, food delivery, electronics, and beauty — credited straight to your wallet."
      chat={{
        title: "Cashback AI Assistant",
        placeholder: "Ask how to maximize your cashback...",
        quickAsks: [
          "Highest cashback rate right now?",
          "How do I combine cashback with a promo code?",
          "When does grocery cashback get credited?",
        ],
        systemContext:
          "You are a cashback optimization expert for AgentHub's Cashback Agent, helping users stack and maximize cashback across categories and wallets.",
      }}
    />
  );
}
