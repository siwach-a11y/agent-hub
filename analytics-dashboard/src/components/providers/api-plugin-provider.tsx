"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ApiPluginResult } from "@/lib/api-plugin";

type ApiPluginContextValue = {
  results: ApiPluginResult[];
  addResult: (result: ApiPluginResult) => void;
  removeResult: (connectionId: string) => void;
  clearResults: () => void;
  latestResult: ApiPluginResult | null;
};

const ApiPluginContext = createContext<ApiPluginContextValue | null>(null);

export function ApiPluginProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<ApiPluginResult[]>([]);

  const addResult = useCallback((result: ApiPluginResult) => {
    setResults((prev) => [result, ...prev]);
  }, []);

  const removeResult = useCallback((connectionId: string) => {
    setResults((prev) => prev.filter((r) => r.connectionId !== connectionId));
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const latestResult = results[0] ?? null;

  const value = useMemo(
    () => ({
      results,
      addResult,
      removeResult,
      clearResults,
      latestResult,
    }),
    [results, addResult, removeResult, clearResults, latestResult]
  );

  return (
    <ApiPluginContext.Provider value={value}>{children}</ApiPluginContext.Provider>
  );
}

export function useApiPlugin() {
  const ctx = useContext(ApiPluginContext);
  if (!ctx) {
    throw new Error("useApiPlugin must be used within ApiPluginProvider");
  }
  return ctx;
}
