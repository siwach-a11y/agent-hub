"use client";

import { useEffect, useState } from "react";
import {
  clearStoredKey,
  getStoredKey,
  onKeyChange,
  setStoredKey,
} from "@/lib/anthropicKey";

interface KeyManagerProps {
  /** Compact single-row layout for tight spaces (e.g. the marketplace dock). */
  compact?: boolean;
}

function maskKey(key: string): string {
  if (key.length <= 12) return "sk-ant-…";
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

export default function KeyManager({ compact = false }: KeyManagerProps) {
  const [storedKey, setStored] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setStored(getStoredKey());
    sync();
    return onKeyChange(sync);
  }, []);

  // Avoid hydration mismatch: localStorage is only readable after mount.
  if (!mounted) return null;

  const connected = Boolean(storedKey);

  const save = () => {
    if (!draft.trim()) return;
    setStoredKey(draft);
    setDraft("");
  };

  if (connected) {
    return (
      <div
        className={`flex items-center gap-2 ${
          compact ? "" : "rounded-xl p-3 bg-hub-green-light/50 border border-hub-green/20"
        }`}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-hub-green">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-hub-green" />
          </span>
          AI connected
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          {maskKey(storedKey as string)}
        </span>
        <button
          onClick={clearStoredKey}
          className="ml-auto text-[11px] font-medium text-slate-400 hover:text-hub-coral transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex items-center gap-2"
          : "rounded-xl p-3.5 bg-white/90 border border-white shadow-sm space-y-2.5"
      }
    >
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span>🔑</span> Connect AI
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="sk-ant-…"
          className="input-modern flex-1 !py-2 font-mono text-xs"
          autoComplete="off"
        />
        <button
          onClick={save}
          disabled={!draft.trim()}
          className="btn-primary !py-2 !px-4 !text-xs shrink-0"
        >
          Save
        </button>
      </div>
      {!compact && (
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Paste your own key from{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="text-hub-blue hover:underline"
          >
            console.anthropic.com
          </a>
          . Stored only in your browser — sent directly to Anthropic, never to
          this site.
        </p>
      )}
    </div>
  );
}
