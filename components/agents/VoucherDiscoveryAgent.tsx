"use client";

import RewardsAgentView from "@/components/agents/rewards/RewardsAgentView";

export default function VoucherDiscoveryAgent() {
  return (
    <RewardsAgentView
      type="voucher"
      icon="🎟️"
      actionLabel="Get Voucher"
      intro="Discover redeemable vouchers across dining, fashion, travel, and beauty. Filter by category or search a brand, then claim before they expire."
      chat={{
        title: "Voucher AI Assistant",
        placeholder: "Ask about vouchers and how to stack them...",
        quickAsks: [
          "Best travel vouchers this month?",
          "Can I stack a voucher with cashback?",
          "Any no-minimum dining vouchers?",
        ],
        systemContext:
          "You are a voucher-hunting expert for AgentHub's Voucher Discovery Agent, helping users find, compare, and redeem vouchers across categories.",
      }}
    />
  );
}
