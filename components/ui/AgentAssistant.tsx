"use client";

import { useEffect, useRef, useState } from "react";
import {
  streamChatResponse,
  type ChatSource,
} from "@/lib/chatClient";
import {
  clearStoredKey,
  getStoredKey,
  hasStoredKey,
  MISSING_KEY_ERROR,
  onKeyChange,
  setStoredKey,
} from "@/lib/anthropicKey";

const MODEL_LABEL = "claude-opus-4-5";

const COUNTRY_STORAGE_KEY = "search_country";

const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  sources: ChatSource[];
  error?: boolean;
}

interface AgentAssistantProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  icon: string;
  placeholder: string;
  quickAsks: string[];
  systemContext: string;
  /** When set, this prompt is auto-sent on open (e.g. from Details/Alternatives). */
  initialPrompt?: string;
}

function ExternalLinkIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400/80"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

/** Human-friendly website label, e.g. "cnbc.com/select/best-credit-cards". */
function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/$/, "");
    const label = `${host}${path}`;
    return label.length > 60 ? `${label.slice(0, 57)}…` : label;
  } catch {
    return url;
  }
}

export default function AgentAssistant({
  open,
  onClose,
  agentName,
  icon,
  placeholder,
  quickAsks,
  systemContext,
  initialPrompt,
}: AgentAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [country, setCountry] = useState("US");
  const bodyEndRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    const sync = () => setConnected(hasStoredKey());
    sync();
    const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (stored) setCountry(stored);
    return onKeyChange(sync);
  }, []);

  const changeCountry = (code: string) => {
    setCountry(code);
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, code);
  };

  useEffect(() => {
    bodyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || isLoading) return;

    if (!getStoredKey()) {
      setShowKeyForm(true);
      return;
    }

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text, sources: [] },
      { role: "assistant", text: "", sources: [] },
    ]);
    setIsLoading(true);

    const searchDirective = `Use web search to find current, real offers and information available in ${countryName(country)}. Prioritize sources and deals relevant to that country. Answer concisely and cite the specific source websites you used with their links. If the question is vague, make reasonable assumptions and still search — do not just ask clarifying questions.`;
    const prompt = systemContext
      ? `${systemContext}\n\n${searchDirective}\n\nUser question: ${text}`
      : `${searchDirective}\n\nUser question: ${text}`;

    const update = (patch: Partial<Message>) =>
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], ...patch };
        return next;
      });

    try {
      await streamChatResponse(prompt, true, ({ text: t, sources }) =>
        update({ text: t, sources })
      );
    } catch (err) {
      const message =
        err instanceof Error && err.name === MISSING_KEY_ERROR
          ? "Add your Anthropic API key below to start."
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      update({ text: message, error: true });
      if (err instanceof Error && err.name === MISSING_KEY_ERROR) {
        setShowKeyForm(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-send an initial prompt once when opened.
  useEffect(() => {
    if (open && initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      send(initialPrompt);
    }
    if (!open) sentInitial.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt]);

  if (!open) return null;

  const saveKey = () => {
    if (!keyDraft.trim()) return;
    setStoredKey(keyDraft);
    setKeyDraft("");
    setShowKeyForm(false);
  };

  const empty = messages.length === 0;
  const needsKey = !connected || showKeyForm;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] flex flex-col rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xl shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold tracking-tight truncate">
              {agentName}
            </h3>
            <p className="text-xs text-neutral-400">
              Powered by Claude · {MODEL_LABEL}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto w-9 h-9 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {empty && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-neutral-400">
                Ask {agentName} anything — answers are grounded with live web
                search and cited sources.
              </p>
              {quickAsks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quickAsks.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex justify-end">
                <span className="inline-block px-3.5 py-2 rounded-2xl rounded-br-md bg-white/10 text-neutral-100 text-sm max-w-[85%]">
                  {msg.text}
                </span>
              </div>
            ) : (
              <div key={i} className="space-y-2.5">
                {msg.sources.length > 0 && (
                  <ul className="space-y-2.5">
                    {msg.sources.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-start gap-2 leading-snug"
                        >
                          <ExternalLinkIcon />
                          <span className="min-w-0">
                            <span className="block text-[15px] text-amber-300/90 group-hover:text-amber-200 group-hover:underline">
                              {s.title}
                            </span>
                            <span className="block text-xs text-neutral-500 group-hover:text-neutral-400 truncate">
                              {prettyUrl(s.url)}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {msg.text && (
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.error ? "text-rose-300" : "text-neutral-200"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                {!msg.text &&
                  msg.sources.length === 0 &&
                  isLoading &&
                  i === messages.length - 1 && (
                    <p className="text-sm text-neutral-500">Searching…</p>
                  )}
              </div>
            )
          )}
          <div ref={bodyEndRef} />
        </div>

        {/* Key form (shown when no key or user triggered it) */}
        {needsKey && (
          <div className="px-6 py-3 border-t border-white/10 bg-amber-500/5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200">
              <span>🔑</span> Connect AI
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                placeholder="sk-ant-…"
                autoComplete="off"
                className="flex-1 rounded-xl bg-neutral-800 border border-white/10 px-3 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/40"
              />
              <button
                onClick={saveKey}
                disabled={!keyDraft.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-900 text-xs font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Paste your own key from{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 hover:underline"
              >
                console.anthropic.com
              </a>
              . Stored only in your browser — sent directly to Anthropic.
            </p>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-end gap-2 px-1 pb-2">
            <label className="text-[11px] text-neutral-500">Search region</label>
            <select
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              className="rounded-lg bg-neutral-800 border border-white/10 text-xs text-neutral-200 py-1 pl-2 pr-6 focus:outline-none focus:border-white/20"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 rounded-2xl bg-neutral-800 border border-white/10 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-white/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send"
              className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between px-1 py-2.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-neutral-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              {connected ? "Key stored in your browser only" : "Add your key to start"}
            </span>
            {connected && (
              <button
                onClick={() => {
                  clearStoredKey();
                  setShowKeyForm(false);
                }}
                className="text-neutral-400 hover:text-rose-400 transition-colors"
              >
                Forget key
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
