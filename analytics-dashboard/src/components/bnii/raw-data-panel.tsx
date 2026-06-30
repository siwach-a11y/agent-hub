"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawDataTable } from "@/components/bnii/raw-data-table";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { bniiApi } from "@/lib/api";
import {
  BNII_RAW_DATA_WORKSPACE_IDS,
  defaultBniiRawDataWorkspace,
  isBniiRawDataWorkspace,
} from "@/lib/bnii/raw-data-countries";
import type { RawDataMultiSummary, RawDataSummary } from "@/types/bnii-raw-data";
import bniiRawDataSnapshot from "@/data/bnii-raw-data-snapshot.json";

const STATIC_RAW_DATA =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true"
    ? (bniiRawDataSnapshot as RawDataMultiSummary)
    : null;

export function RawDataPanel() {
  const { workspaceId, setWorkspaceId, options } = useWorkspace();
  const [summaries, setSummaries] = useState<RawDataSummary[]>(
    () => STATIC_RAW_DATA?.countries ?? []
  );
  const [loading, setLoading] = useState(!STATIC_RAW_DATA);
  const [error, setError] = useState<string | null>(null);

  const countryOptions = useMemo(
    () => options.filter((opt) => isBniiRawDataWorkspace(opt.id)),
    [options]
  );

  const activeTabId = isBniiRawDataWorkspace(workspaceId)
    ? workspaceId
    : defaultBniiRawDataWorkspace();

  const summaryById = useMemo(
    () => new Map(summaries.map((summary) => [summary.workspaceId, summary])),
    [summaries]
  );

  const load = useCallback(async () => {
    if (STATIC_RAW_DATA) {
      setSummaries(STATIC_RAW_DATA.countries);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await bniiApi.rawDataAll();
      setSummaries(result.countries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load raw data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isBniiRawDataWorkspace(workspaceId)) {
      setWorkspaceId(defaultBniiRawDataWorkspace());
    }
  }, [workspaceId, setWorkspaceId]);

  function handleTabChange(value: string) {
    if (isBniiRawDataWorkspace(value)) {
      setWorkspaceId(value);
    }
  }

  if (loading && summaries.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#e8e0d4] bg-white dark:border-border dark:bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && summaries.length === 0) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" size="sm" className="mt-3" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        BNII Raw Data covers {BNII_RAW_DATA_WORKSPACE_IDS.length} countries — Thailand is not on
        the API.
      </p>
      <Tabs value={activeTabId} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {countryOptions.map((opt) => {
            const summary = summaryById.get(opt.id);
            const live = summary?.liveFieldsTarget ?? "—";
            return (
              <TabsTrigger
                key={opt.id}
                value={opt.id}
                className="gap-1.5 text-xs data-[state=active]:bg-background"
              >
                <span aria-hidden>{opt.flag}</span>
                <span>{opt.country}</span>
                <span className="text-[10px] text-muted-foreground">({live}/28)</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {countryOptions.map((opt) => {
          const summary = summaryById.get(opt.id);
          if (!summary) return null;

          return (
            <TabsContent key={opt.id} value={opt.id} className="mt-4">
              <RawDataTable
                data={summary}
                loading={loading}
                onRefresh={() => void load()}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
