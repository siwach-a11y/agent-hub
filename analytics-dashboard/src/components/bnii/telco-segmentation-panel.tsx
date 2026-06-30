"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { GitBranch, Layers, Loader2 } from "lucide-react";
import { ChartContainer } from "@/components/charts/chart-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bniiApi } from "@/lib/api";
import {
  getTelcoClusterAnalytics,
  TELCO_CLUSTER_MODELS,
} from "@/lib/bnii/telco-clustering";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type {
  ClusterMethod,
  TelcoClusterAnalytics,
  TelcoClusterModelId,
} from "@/types/clustering";
import type { WorkspaceId } from "@/data/workspaces";
import { cn } from "@/lib/utils";

type TelcoSegmentationPanelProps = {
  /** Active workspace to highlight among the clustered telcos. */
  workspaceId?: WorkspaceId;
};

function ProvenanceBadge({ source }: { source: TelcoClusterAnalytics["source"] }) {
  if (source === "api") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400">
        ● Live BNII data
      </Badge>
    );
  }
  if (source === "mixed") {
    return (
      <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
        Partial live · some telcos on demo fallback
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Demo fallback · set partner UUIDs for live data
    </Badge>
  );
}

export function TelcoSegmentationPanel({ workspaceId }: TelcoSegmentationPanelProps) {
  const [method, setMethod] = useState<ClusterMethod>("kmeans");
  const [modelId, setModelId] = useState<TelcoClusterModelId>("engagement_scale");
  const [analytics, setAnalytics] = useState<TelcoClusterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    bniiApi
      .rawDataPlatform()
      .then((snapshot) => {
        if (active) setAnalytics(getTelcoClusterAnalytics(snapshot));
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load BNII raw data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeResult = useMemo(() => {
    if (!analytics) return null;
    const list = method === "kmeans" ? analytics.kmeans : analytics.hierarchical;
    return list.find((r) => r.modelId === modelId) ?? list[0];
  }, [analytics, method, modelId]);

  const modelDef = TELCO_CLUSTER_MODELS.find((m) => m.id === modelId);

  const scatterData = useMemo(() => {
    if (!activeResult) return [];
    return activeResult.assignments.map((a) => ({
      x: a.x,
      y: a.y,
      code: a.code,
      clusterLabel: a.clusterLabel,
      isActive: a.id === workspaceId,
      fill:
        activeResult.profiles.find((p) => p.clusterId === a.clusterId)?.color ?? "#888",
    }));
  }, [activeResult, workspaceId]);

  const barData = activeResult?.profiles.map((p) => ({
    name: p.label,
    value: p.count,
    fill: p.color,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading BNII raw data…
      </div>
    );
  }

  if (error || !analytics || !activeResult) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        {error ?? "No BNII raw data available to cluster."}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-[#1a1510] dark:text-foreground">
            Telco segmentation
          </h2>
          <p className="mt-1 text-sm text-[#6b6258] dark:text-muted-foreground">
            {analytics.telcoCount} BNII telco partners clustered on real aggregate metrics ·
            K-Means &amp; hierarchical
            {analytics.dateTo ? ` · 30d to ${analytics.dateTo}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <ProvenanceBadge source={analytics.source} />
          <Tabs
            value={method}
            onValueChange={(v) => setMethod(v as ClusterMethod)}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-[280px]">
              <TabsTrigger value="kmeans" className="gap-1.5 text-xs">
                <Layers className="h-3.5 w-3.5" />
                K-Means
              </TabsTrigger>
              <TabsTrigger value="hierarchical" className="gap-1.5 text-xs">
                <GitBranch className="h-3.5 w-3.5" />
                Hierarchical
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {analytics.models.map((model) => (
          <Button
            key={model.id}
            type="button"
            size="sm"
            variant={modelId === model.id ? "default" : "outline"}
            className={cn(
              "h-8 text-[10px]",
              modelId !== model.id && "border-[#e8e0d4] bg-white text-[#5c5348]"
            )}
            onClick={() => setModelId(model.id)}
          >
            {model.label}
          </Button>
        ))}
      </div>

      {modelDef && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-[#8a7f72] dark:text-muted-foreground">
            {modelDef.description}
          </p>
          {activeResult.featureFields.map((f) => (
            <Badge key={f.id} variant="secondary" className="text-[9px]">
              {f.label}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer
          title="Cluster map"
          subtitle={`${method === "kmeans" ? "K-Means" : "Hierarchical"} · each point is a telco`}
          action={
            <Badge variant="outline" className="text-[10px]">
              Silhouette {activeResult.silhouette.toFixed(2)}
            </Badge>
          }
          className="border-[#e8e0d4] bg-white dark:bg-card"
        >
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis
                type="number"
                dataKey="x"
                name="Dim 1"
                tick={CHART_AXIS_TICK_SM}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Dim 2"
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(_v, _n, item) => {
                  const p = item?.payload as { code?: string; clusterLabel?: string } | undefined;
                  return [p?.clusterLabel ?? "", p?.code ?? ""];
                }}
              />
              <Scatter data={scatterData} fill="#888">
                {scatterData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.fill}
                    stroke={entry.isActive ? "#1a1510" : undefined}
                    strokeWidth={entry.isActive ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Cluster distribution"
          subtitle="Telco partners per segment"
          className="border-[#e8e0d4] bg-white dark:bg-card"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={CHART_AXIS_TICK_SM}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
                interval={0}
                angle={-22}
                textAnchor="end"
                height={64}
              />
              <YAxis
                allowDecimals={false}
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" name="Telcos" radius={[4, 4, 0, 0]}>
                {barData?.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeResult.profiles.map((profile) => (
          <Card key={profile.clusterId} className="border-[#e8e0d4] bg-white shadow-sm dark:bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: profile.color }}
                />
                <h3 className="text-sm font-semibold">{profile.label}</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {profile.count} telco{profile.count === 1 ? "" : "s"} ({profile.share.toFixed(0)}%)
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.members.map((code) => (
                  <Badge key={code} variant="secondary" className="text-[9px]">
                    {code}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground">
                Avg {activeResult.primaryFieldLabel}
              </p>
              <p className="font-mono text-xl font-bold tabular-nums">
                {formatNumber(Math.round(profile.avgPrimary), true)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeResult.excluded.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Excluded (no data for these features): {activeResult.excluded.join(", ")}.
        </p>
      )}
    </div>
  );
}
