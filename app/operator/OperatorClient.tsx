"use client";

import { useCallback, useEffect, useState } from "react";
import { DiscoveredOffer, PipelineStatus } from "@/lib/pipeline/types";
import { DISCOVERY_PROFILES } from "@/lib/pipeline/profiles";
import { rewardCategories } from "@/lib/data/rewards";
import {
  actOnOffer,
  fetchQueue,
  getOperatorKey,
  runDiscovery,
  setOperatorKey,
} from "@/lib/pipeline/client";

const REWARD_TYPES = Object.values(DISCOVERY_PROFILES);
const CATEGORIES = rewardCategories.filter((c) => c !== "All");
const COUNTRIES = [
  ["US", "🇺🇸 United States"],
  ["GB", "🇬🇧 United Kingdom"],
  ["TH", "🇹🇭 Thailand"],
  ["SG", "🇸🇬 Singapore"],
  ["MY", "🇲🇾 Malaysia"],
  ["IN", "🇮🇳 India"],
] as const;

const STATUS_TABS: { key: PipelineStatus; label: string }[] = [
  { key: "pending_approval", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<PipelineStatus, string> = {
  pending_approval: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  published: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function OperatorClient() {
  const [needKey, setNeedKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [offers, setOffers] = useState<DiscoveredOffer[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<PipelineStatus>("pending_approval");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rewardType, setRewardType] = useState(REWARD_TYPES[0].rewardType);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [country, setCountry] = useState("US");
  const [discovering, setDiscovering] = useState(false);

  const load = useCallback(async (status: PipelineStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchQueue(status);
      setOffers(res.offers);
      setCounts(res.counts);
      setNeedKey(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.toLowerCase().includes("unauthorized")) setNeedKey(true);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const saveKey = () => {
    setOperatorKey(keyDraft);
    setKeyDraft("");
    load(tab);
  };

  const onDiscover = async () => {
    setDiscovering(true);
    setToast(null);
    setError(null);
    try {
      const res = await runDiscovery({ rewardType, category, country });
      setToast(
        `Discovered ${res.discovered} · added ${res.added} · skipped ${res.skipped} (dupes)`
      );
      setTab("pending_approval");
      await load("pending_approval");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discovery failed");
    } finally {
      setDiscovering(false);
    }
  };

  const act = async (id: string, action: "approve" | "reject" | "publish") => {
    try {
      await actOnOffer(id, action);
      await load(tab);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          🛠️
        </div>
        <div>
          <h1 className="font-semibold tracking-tight">Operator Pipeline</h1>
          <p className="text-xs text-neutral-500">
            Discover → Queue → Approve → Publish
          </p>
        </div>
        <a
          href="/"
          className="ml-auto text-xs text-neutral-400 hover:text-neutral-200"
        >
          ← Marketplace
        </a>
      </header>

      {needKey ? (
        <div className="max-w-md mx-auto mt-24 rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-3">
          <h2 className="font-semibold">Operator access</h2>
          <p className="text-xs text-neutral-500">
            Enter the operator passphrase (OPERATOR_PASSPHRASE) to manage the
            pipeline.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveKey()}
              placeholder="passphrase"
              className="flex-1 rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/40"
            />
            <button
              onClick={saveKey}
              className="px-4 rounded-xl bg-amber-500 text-neutral-900 text-sm font-semibold hover:bg-amber-400"
            >
              Enter
            </button>
          </div>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* Discovery trigger */}
          <section className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
            <h2 className="text-sm font-semibold mb-3">Run discovery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as typeof rewardType)}
                className="rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm"
              >
                {REWARD_TYPES.map((p) => (
                  <option key={p.rewardType} value={p.rewardType}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-sm"
              >
                {COUNTRIES.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={onDiscover}
                disabled={discovering}
                className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold py-2 hover:opacity-90 disabled:opacity-50"
              >
                {discovering ? "Discovering…" : "Discover offers"}
              </button>
            </div>
            {toast && <p className="mt-3 text-xs text-emerald-300">{toast}</p>}
            {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
          </section>

          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s.key}
                onClick={() => setTab(s.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  tab === s.key
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-transparent border-white/10 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {s.label}
                <span className="ml-1.5 text-neutral-500">
                  {counts[s.key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Queue table */}
          <section className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
            {loading ? (
              <p className="p-6 text-sm text-neutral-500">Loading…</p>
            ) : offers.length === 0 ? (
              <p className="p-6 text-sm text-neutral-500">
                No offers in “{tab.replace("_", " ")}”. Run discovery to populate
                the queue.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-white/10">
                    <th className="px-4 py-2.5 font-medium">Offer</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Value</th>
                    <th className="px-4 py-2.5 font-medium">Region</th>
                    <th className="px-4 py-2.5 font-medium">Score</th>
                    <th className="px-4 py-2.5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.id} className="border-b border-white/5 align-top">
                      <td className="px-4 py-3">
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-neutral-100 hover:text-amber-300"
                        >
                          {o.title}
                        </a>
                        <div className="text-xs text-neutral-500">
                          {o.merchant} · {o.category}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {DISCOVERY_PROFILES[o.rewardType].label}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {o.discountText ?? "—"}
                        {o.promoCode && (
                          <span className="ml-1 text-[11px] font-mono text-amber-300">
                            {o.promoCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">{o.country}</td>
                      <td className="px-4 py-3 tabular-nums text-neutral-400">
                        {o.score}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(o.status === "pending_approval" ||
                            o.status === "rejected") && (
                            <button
                              onClick={() => act(o.id, "approve")}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-xs hover:bg-sky-500/25"
                            >
                              Approve
                            </button>
                          )}
                          {o.status === "approved" && (
                            <button
                              onClick={() => act(o.id, "publish")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs hover:bg-emerald-500/25"
                            >
                              Publish
                            </button>
                          )}
                          {o.status !== "rejected" &&
                            o.status !== "published" && (
                              <button
                                onClick={() => act(o.id, "reject")}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs hover:bg-rose-500/25"
                              >
                                Reject
                              </button>
                            )}
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[11px] ${STATUS_BADGE[o.status]}`}
                          >
                            {o.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
