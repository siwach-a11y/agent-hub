"use client";

import { useMemo, useState } from "react";
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
import { GitBranch, Layers } from "lucide-react";
import { ChartContainer } from "@/components/charts/chart-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getWorkspaceClusterAnalytics,
  SEGMENTATION_MODELS,
} from "@/data/workspace-clustering";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type { ClusterMethod, SegmentationModelId } from "@/types/clustering";
import type { WorkspaceId } from "@/data/workspaces";
import { cn } from "@/lib/utils";

type ClusterSegmentationPanelProps = {
  workspaceId: WorkspaceId;
};

export function ClusterSegmentationPanel({ workspaceId }: ClusterSegmentationPanelProps) {
  const [method, setMethod] = useState<ClusterMethod>("kmeans");
  const [modelId, setModelId] = useState<SegmentationModelId>("behavioral");

  const analytics = useMemo(() => getWorkspaceClusterAnalytics(workspaceId), [workspaceId]);

  const activeResult = useMemo(() => {
    const list = method === "kmeans" ? analytics.kmeans : analytics.hierarchical;
    return list.find((r) => r.modelId === modelId) ?? list[0];
  }, [analytics, method, modelId]);

  const modelDef = SEGMENTATION_MODELS.find((m) => m.id === modelId);

  const scatterData = useMemo(() => {
    if (!activeResult) return [];
    return activeResult.assignments.map((a) => ({
      x: a.x,
      y: a.y,
      clusterLabel: a.clusterLabel,
      fill:
        activeResult.profiles.find((p) => p.clusterId === a.clusterId)?.color ?? "#888",
    }));
  }, [activeResult]);

  const barData = activeResult?.profiles.map((p) => ({
    name: p.label,
    value: p.count,
    fill: p.color,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium tracking-tight text-[#1a1510] dark:text-foreground">
            Subscriber clustering
          </h2>
          <p className="mt-1 text-sm text-[#6b6258] dark:text-muted-foreground">
            {analytics.subscriberCount} subscriber profiles · K-Means & hierarchical segmentation
          </p>
        </div>
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

      <div className="flex flex-wrap gap-2">
        {SEGMENTATION_MODELS.map((model) => (
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

      {modelDef && activeResult && (
        <p className="text-xs text-[#8a7f72] dark:text-muted-foreground">{modelDef.description}</p>
      )}

      {activeResult && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer
            title="Cluster map"
            subtitle={`${method === "kmeans" ? "K-Means" : "Hierarchical"} · 2D feature projection`}
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
                <ZAxis range={[24, 24]} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => Number(v ?? 0).toFixed(3)}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as { clusterLabel?: string } | undefined;
                    return item?.clusterLabel ?? "";
                  }}
                />
                <Scatter data={scatterData} fill="#888" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Cluster distribution"
            subtitle="Subscriber count per segment"
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
                  tickFormatter={(v) => formatNumber(v, true)}
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => formatNumber(Number(v ?? 0), true)}
                />
                <Bar dataKey="value" name="Subscribers" radius={[4, 4, 0, 0]}>
                  {barData?.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {activeResult && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeResult.profiles.map((profile) => (
            <Card
              key={profile.clusterId}
              className="border-[#e8e0d4] bg-white shadow-sm dark:bg-card"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: profile.color }}
                  />
                  <h3 className="text-sm font-semibold">{profile.label}</h3>
                </div>
                <p className="mt-2 font-mono text-2xl font-bold tabular-nums">
                  {formatNumber(profile.count, true)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({profile.share.toFixed(1)}%)
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {profile.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-[9px]">
                      {trait}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Eng {profile.avgEngagement.toFixed(2)} · BNRY velocity{" "}
                  {formatNumber(profile.avgValue, true)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
