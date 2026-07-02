"use client";

import { useState, useMemo } from "react";
import {
  agents,
  categories,
  getFeaturedAgents,
  getMarketplaceStats,
} from "@/lib/data/agents";
import AgentCard from "@/components/marketplace/AgentCard";
import StatsRow from "@/components/marketplace/StatsRow";
import CategoryChips from "@/components/marketplace/CategoryChips";
import MarketplaceChat from "@/components/marketplace/MarketplaceChat";
import PublishedOffers from "@/components/marketplace/PublishedOffers";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const stats = getMarketplaceStats();
  const featured = getFeaturedAgents();

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.author.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [search, category]);

  return (
    <div className="page-bg pb-32">
      <header className="glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="icon-box w-10 h-10 text-lg">🤖</div>
              <div>
                <h1 className="text-lg font-bold tracking-tight gradient-text">
                  AgentHub
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hidden sm:block">
                  AI Marketplace
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-md relative hidden md:block">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-modern pl-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section className="animate-slide-up text-center sm:text-left pt-4 pb-2">
          <p className="section-title mb-3">Welcome to the future of AI tools</p>
          <h2 className="heading-lg text-balance max-w-2xl">
            Discover agents that{" "}
            <span className="gradient-text">work for you</span>
          </h2>
          <p className="mt-3 text-slate-500 text-base max-w-xl leading-relaxed">
            Browse curated AI agents for vouchers, daily deals, cashback, promo
            codes, loyalty rewards, and flash sales — find the best savings in
            seconds.
          </p>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <StatsRow
            totalAgents={stats.totalAgents}
            categories={stats.categories}
            monthlyUsers={stats.monthlyUsers}
            avgRating={stats.avgRating}
          />
        </section>

        <section>
          <CategoryChips
            categories={categories}
            active={category}
            onChange={setCategory}
          />
        </section>

        {!search && category === "All" && <PublishedOffers />}

        {!search && category === "All" && (
          <section>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="section-title mb-1">Curated picks</p>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Featured Agents
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((agent) => (
                <AgentCard key={agent.id} agent={agent} featured />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="section-title mb-1">Full catalog</p>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {search || category !== "All" ? "Search Results" : "All Agents"}
                <span className="ml-2 text-base font-normal text-slate-400">
                  {filtered.length}
                </span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="glass-panel py-16 text-center">
              <p className="text-slate-500">
                No agents match your search. Try different keywords or categories.
              </p>
            </div>
          )}
        </section>
      </main>

      <MarketplaceChat />
    </div>
  );
}
