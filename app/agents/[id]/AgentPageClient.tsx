"use client";

import { useRouter } from "next/navigation";
import { getAgentById } from "@/lib/data/agents";
import VoucherDiscoveryAgent from "@/components/agents/VoucherDiscoveryAgent";
import DailyDealsAgent from "@/components/agents/DailyDealsAgent";
import CashbackAgent from "@/components/agents/CashbackAgent";
import PromoCodeAgent from "@/components/agents/PromoCodeAgent";
import LoyaltyRewardsAgent from "@/components/agents/LoyaltyRewardsAgent";
import BuyOneGetOneAgent from "@/components/agents/BuyOneGetOneAgent";
import FlashSaleAgent from "@/components/agents/FlashSaleAgent";
import { type ComponentType } from "react";

const agentComponents: Record<string, ComponentType> = {
  "voucher-discovery": VoucherDiscoveryAgent,
  "daily-deals": DailyDealsAgent,
  "cashback": CashbackAgent,
  "promo-code": PromoCodeAgent,
  "loyalty-rewards": LoyaltyRewardsAgent,
  "buy-one-get-one": BuyOneGetOneAgent,
  "flash-sale": FlashSaleAgent,
};

export default function AgentPageClient({ id }: { id: string }) {
  const router = useRouter();
  const agent = getAgentById(id);
  const AgentComponent = agentComponents[id];

  if (!agent || !AgentComponent) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-10 text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Agent Not Found
          </h1>
          <p className="text-slate-500 mb-6 text-sm">
            The agent you&apos;re looking for doesn&apos;t exist.
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <header className="glass-nav">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-hub-teal hover:text-hub-green transition-colors mb-4 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Marketplace
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="icon-box w-14 h-14 text-3xl shrink-0">{agent.icon}</div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {agent.name}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  by {agent.author}
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {agent.rating}
                  </span>
                  <span className="text-slate-400 ml-1">
                    ({agent.reviewCount.toLocaleString()} reviews)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AgentComponent />
      </main>
    </div>
  );
}
