"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  ArrowRight,
  Activity,
  Globe2,
  Megaphone,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AppLink } from "@/components/app-link";
import { DataUploadButtons } from "@/components/analytics/data-upload-buttons";
import { UploadDashboard } from "@/components/analytics/upload-dashboard";
import { ApiPluginButton } from "@/components/api-plugin/api-plugin-button";
import { ApiPluginDashboard } from "@/components/api-plugin/api-plugin-dashboard";
import { ChartContainer } from "@/components/charts/chart-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { useUploadAnalytics } from "@/components/providers/upload-analytics-provider";
import { useApiPlugin } from "@/components/providers/api-plugin-provider";
import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspaceAnalytics } from "@/data/u9-analytics";
import { formatNumber, formatPercent } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/workspace/u9",
    label: "Workspace",
    description: "Token economy, burn mix, Atlas view",
    icon: Globe2,
    accent: "border-[#e8e0d4] bg-[#faf6f0] dark:bg-[#2a2418]/40 dark:border-[#4a4034]",
  },
  {
    href: "/customers",
    label: "Subscribers",
    description: "Lifecycle, cohorts, earn channels",
    icon: Users,
    accent: "",
  },
  {
    href: "/marketing",
    label: "Engagement",
    description: "Campaigns, segments, BNRY lift",
    icon: Megaphone,
    accent: "",
  },
];

function HeroMetric({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card/80 p-3 backdrop-blur-sm",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold tracking-tight lg:text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Homepage() {
  const { workspace, earnChannels, workspaceId } = useWorkspace();
  const { uploads } = useUploadAnalytics();
  const { results: pluginResults } = useApiPlugin();
  const ws = workspace.workspace;

  function scrollToUploadViz() {
    document.getElementById("upload-dashboard")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToPluginViz() {
    document.getElementById("api-plugin-dashboard")?.scrollIntoView({ behavior: "smooth" });
  }
  const dashboardData = useMemo(
    () => getWorkspaceAnalytics(workspaceId),
    [workspaceId]
  );

  const customerData = useMemo(
    () => getCustomerAnalytics(workspaceId),
    [workspaceId]
  );

  const marketingData = useMemo(
    () => getMarketingAnalytics(workspaceId),
    [workspaceId]
  );

  const mauSeries = useMemo(
    () =>
      customerData.timeSeries.map((p) => ({
        month: p.date,
        mau: p.activeCustomers,
        subscribers: p.totalCustomers,
      })),
    [customerData.timeSeries]
  );

  const earnBarData = useMemo(
    () => [
      { name: "STW", value: workspace.earn.stw, color: "#8b6914" },
      { name: "Quest", value: workspace.earn.quest, color: "#2d6a4f" },
      { name: "Screen", value: workspace.earn.screenTime, color: "#7c5cbf" },
      { name: "Video", value: workspace.earn.video, color: "#c4a574" },
    ],
    [workspace.earn]
  );

  const scaledMarketing = useMemo(
    () => ({
      eventsTracked30d: marketingData.eventsTracked30d,
      avgEngagementScore: marketingData.avgEngagementScore,
      activeCampaigns: marketingData.activeCampaigns,
      avgCampaignRoas: workspace.earnBurnRatio,
    }),
    [marketingData, workspace.earnBurnRatio]
  );

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative border-b border-border bg-gradient-to-br from-[#faf6f0] via-background to-background px-4 py-8 dark:from-[#1a1510] dark:via-background lg:px-8 lg:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl" aria-hidden>{ws.flag}</span>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {ws.name} · {ws.country}
                </h1>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  {ws.tier}
                </Badge>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {ws.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                BNII Analytics command center — {formatNumber(ws.subscribers, true)}{" "}
                subscribers, live earn/burn telemetry, and engagement intelligence for the{" "}
                {ws.code} workspace.
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80">{dashboardData.apiNote}</p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-wrap gap-2">
                <DataUploadButtons onUploaded={scrollToUploadViz} />
                <ApiPluginButton variant="inline" onConnected={scrollToPluginViz} />
              </div>
              <AppLink href="/workspace/u9">
                <Button variant="outline" className="gap-2">
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </AppLink>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <HeroMetric label="DAU" value={formatNumber(workspace.dau, true)} hint="daily actives" />
            <HeroMetric
              label="MAU"
              value={formatNumber(workspace.mau, true)}
              hint={`${workspace.engagement.dauMauStickiness}% stickiness`}
            />
            <HeroMetric
              label="BNRY Earned"
              value={formatNumber(workspace.bnryEarned30d, true)}
              hint="30 days"
            />
            <HeroMetric
              label="BNRY Burned"
              value={formatNumber(workspace.bnryRedeemed30d, true)}
              hint="30 days"
            />
            <HeroMetric
              label="Earn / Burn"
              value={`${workspace.earnBurnRatio}x`}
              hint="healthy > 1"
            />
            <HeroMetric
              label="Net BNRY"
              value={String(workspace.netBnryPerUser)}
              hint="per user"
            />
            <HeroMetric
              label="STW Winners"
              value={formatNumber(workspace.stwWinners30d, true)}
              hint="30 days"
            />
            <HeroMetric
              label="Campaigns"
              value={String(scaledMarketing.activeCampaigns)}
              hint="active now"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
        {uploads.length === 0 && pluginResults.length === 0 ? (
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Analyze your data</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a picture or PDF, or connect an API plugin — visualizations appear below.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <DataUploadButtons onUploaded={scrollToUploadViz} />
                <ApiPluginButton variant="inline" onConnected={scrollToPluginViz} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <UploadDashboard />
            <ApiPluginDashboard />
          </>
        )}

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, description, icon: Icon, accent }) => (
            <AppLink key={href} href={href} className="group">
              <Card
                className={cn(
                  "h-full transition-all hover:border-primary/40 hover:shadow-md",
                  accent
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{label}</p>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            </AppLink>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer
            title="Subscriber growth"
            subtitle="MAU and total subscribers (6 months)"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mauSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={{ stroke: CHART_COLORS.border }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="subs"
                  tickFormatter={(v) => formatNumber(v, true)}
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <YAxis
                  yAxisId="mau"
                  orientation="right"
                  tickFormatter={(v) => formatNumber(v, true)}
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => formatNumber(Number(v ?? 0), true)}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  yAxisId="subs"
                  type="monotone"
                  dataKey="subscribers"
                  name="Subscribers"
                  stroke="var(--muted-foreground)"
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Area
                  yAxisId="mau"
                  type="monotone"
                  dataKey="mau"
                  name="MAU"
                  stroke="var(--primary)"
                  fill="url(#mauGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Earn channels" subtitle="BNRY issued by source (30d)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={earnBarData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={{ stroke: CHART_COLORS.border }}
                  tickLine={false}
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
                <Bar dataKey="value" name="BNRY" radius={[4, 4, 0, 0]}>
                  {earnBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Bottom panels */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Burn mix</h3>
              </div>
              <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                {dashboardData.burnMix.map((seg) => (
                  <div
                    key={seg.label}
                    style={{
                      width: `${seg.percent}%`,
                      backgroundColor: seg.color,
                    }}
                  />
                ))}
              </div>
              <ul className="mt-3 space-y-2">
                {dashboardData.burnMix.map((seg) => (
                  <li
                    key={seg.label}
                    className="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      {seg.label}
                    </span>
                    <span className="font-mono tabular-nums">
                      {seg.percent}% · {formatNumber(seg.volume, true)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Engagement</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {dashboardData.engagement.slice(0, 4).map((m) => (
                  <li
                    key={m.label}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-mono font-medium tabular-nums">{m.value}</span>
                  </li>
                ))}
              </ul>
              <AppLink
                href="/marketing"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View campaigns
                <ArrowRight className="h-3 w-3" />
              </AppLink>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Earn channels</h3>
              </div>
              <ul className="mt-3 space-y-3">
                {earnChannels.map((ch) => (
                  <li key={ch.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{ch.name}</span>
                      <span className="font-mono text-muted-foreground">
                        {formatNumber(ch.transactions, true)} BNRY
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{ch.marketShare}% share</span>
                      <span>·</span>
                      <span>{formatPercent(ch.growthPercent)} growth</span>
                      <span>·</span>
                      <span>{ch.retention}% retention</span>
                    </div>
                  </li>
                ))}
              </ul>
              <AppLink
                href="/customers"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Subscriber directory
                <ArrowRight className="h-3 w-3" />
              </AppLink>
            </CardContent>
          </Card>
        </div>

        {/* Live signals */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold">Live workspace signals</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatNumber(scaledMarketing.eventsTracked30d, true)} BNRY events tracked ·{" "}
                {scaledMarketing.avgEngagementScore}/100 engagement score ·{" "}
                {scaledMarketing.avgCampaignRoas.toFixed(1)}x earn/burn on active campaigns
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                workspace: {ws.id}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                {ws.country}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                MRR ${ws.mrr}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
