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
  RAW_DATA_COUNTRY_NAMES,
  RAW_DATA_WORKSPACE_ORDER,
  defaultBniiRawDataWorkspace,
  isBniiRawDataWorkspace,
} from "@/lib/bnii/raw-data-countries";
import type { RawDataPlatformSnapshot } from "@/types/bnii-raw-data";
import bniiRawDataSnapshot from "@/data/bnii-raw-data-snapshot.json";

const STATIC_SNAPSHOT =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true"
    ? (bniiRawDataSnapshot as RawDataPlatformSnapshot)
    : null;

export function RawDataPanel() {
  const { workspaceId, setWorkspaceId, options } = useWorkspace();
  const [snapshot, setSnapshot] = useState<RawDataPlatformSnapshot | null>(STATIC_SNAPSHOT);
  const [loading, setLoading] = useState(!STATIC_SNAPSHOT);
  const [error, setError] = useState<string | null>(null);

  const rawDataOptions = useMemo(() => {
    const byId = new Map(options.map((opt) => [opt.id, opt]));
    return RAW_DATA_WORKSPACE_ORDER.map((id) => byId.get(id)).filter(
      (opt): opt is NonNullable<typeof opt> => Boolean(opt)
    );
  }, [options]);

  const activeTabId = isBniiRawDataWorkspace(workspaceId)
    ? workspaceId
    : defaultBniiRawDataWorkspace();

  const countriesById = useMemo(
    () => new Map(snapshot?.bnii.countries.map((entry) => [entry.workspaceId, entry])),
    [snapshot]
  );

  const load = useCallback(async () => {
    if (STATIC_SNAPSHOT) {
      setSnapshot(STATIC_SNAPSHOT);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await bniiApi.rawDataPlatform();
      setSnapshot(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load raw data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleTabChange(value: string) {
    if (isBniiRawDataWorkspace(value)) {
      setWorkspaceId(value);
    }
  }

  if (loading && !snapshot) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#e8e0d4] bg-white dark:border-border dark:bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button type="button" size="sm" className="mt-3" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {BNII_RAW_DATA_WORKSPACE_IDS.length} countries on the BNII Analytics API —{" "}
        {RAW_DATA_COUNTRY_NAMES.join(", ")}.
      </p>
      <Tabs value={activeTabId} onValueChange={handleTabChange}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {rawDataOptions.map((opt) => {
            const summary = countriesById.get(opt.id);
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
        {rawDataOptions.map((opt) => {
          const summary = countriesById.get(opt.id);
          if (!summary) return null;
          return (
            <TabsContent key={opt.id} value={opt.id} className="mt-4">
              <RawDataTable data={summary} loading={loading} onRefresh={() => void load()} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
