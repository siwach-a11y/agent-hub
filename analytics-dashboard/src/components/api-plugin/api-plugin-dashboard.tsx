"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trash2 } from "lucide-react";
import { ChartContainer } from "@/components/charts/chart-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApiPlugin } from "@/components/providers/api-plugin-provider";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type { ApiPluginResult } from "@/lib/api-plugin";
import { getPluginDefinition } from "@/lib/api-plugin/registry";

const CHART_COLORS_LIST = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

function buildChartData(result: ApiPluginResult): { name: string; value: number }[] {
  if (result.numericStats.length > 0) {
    return result.numericStats.map((s) => ({ name: s.name, value: s.avg }));
  }

  if (result.columns.length >= 2 && result.rows.length > 0) {
    const labelCol = result.columns[0];
    const valueCol =
      result.columns.find((col) =>
        result.rows.some((r) => typeof r[col] === "number")
      ) ?? result.columns[1];

    return result.rows
      .filter((r) => typeof r[valueCol] === "number")
      .slice(0, 12)
      .map((r) => ({
        name: String(r[labelCol]).slice(0, 24) || "—",
        value: Number(r[valueCol]),
      }));
  }

  return [];
}

function PluginVizCard({
  result,
  onRemove,
}: {
  result: ApiPluginResult;
  onRemove: () => void;
}) {
  const def = getPluginDefinition(result.pluginId);
  const chartData = useMemo(() => buildChartData(result), [result]);

  return (
    <Card className="border-emerald-500/20 bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-emerald-600">
                API Plugin · {def?.name ?? result.pluginId}
              </Badge>
              <h3 className="font-semibold">{result.name}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {result.rowCount} rows · {result.columns.length} columns
              {result.endpoint ? ` · ${result.endpoint}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {result.rawPreview && result.pluginId === "workspace" && (
          <p className="mt-2 text-xs text-muted-foreground">{result.rawPreview}</p>
        )}

        {chartData.length > 0 && (
          <ChartContainer
            title="API data visualization"
            subtitle="Metrics from connected source"
            className="mt-4 border-0 bg-transparent p-0 shadow-none"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={{ stroke: CHART_COLORS.border }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  tickFormatter={(v) => formatNumber(v, true)}
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => formatNumber(Number(v ?? 0), true)}
                />
                <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS_LIST[i % CHART_COLORS_LIST.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function ApiPluginDashboard() {
  const { results, removeResult } = useApiPlugin();

  if (results.length === 0) return null;

  return (
    <section id="api-plugin-dashboard" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">API plugin visualizations</h2>
        <p className="text-sm text-muted-foreground">
          Live charts from connected API data sources
        </p>
      </div>
      <div className="space-y-4">
        {results.map((result) => (
          <PluginVizCard
            key={result.connectionId}
            result={result}
            onRemove={() => removeResult(result.connectionId)}
          />
        ))}
      </div>
    </section>
  );
}
