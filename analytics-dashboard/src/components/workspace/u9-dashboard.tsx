"use client";

import { useMemo } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { getWorkspaceAnalytics } from "@/data/u9-analytics";
import { ClusterSegmentationPanel } from "@/components/workspace/cluster-segmentation-panel";

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-[#e8e0d4] bg-white p-5 shadow-sm dark:border-border dark:bg-card ${className ?? ""}`}
    >
      <h2 className="font-serif text-xl font-medium tracking-tight text-[#2c2416] dark:text-foreground">
        {title}
      </h2>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8a7f72] dark:text-muted-foreground">
        {subtitle}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KpiCard({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-lg border border-[#e8e0d4] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7f72] dark:text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#1a1510] dark:text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8a7f72] dark:text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function U9Dashboard() {
  const { workspaceId } = useWorkspace();
  const data = useMemo(() => getWorkspaceAnalytics(workspaceId), [workspaceId]);

  return (
    <div className="min-h-full bg-[#f3ece3] text-[#2c2416] dark:bg-background dark:text-foreground">
      <div className="border-b border-[#e8e0d4] bg-[#f3ece3]/95 px-4 py-6 dark:border-border dark:bg-background/95 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{data.workspace.flag}</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            {data.workspace.name}
          </h1>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6b6258] dark:text-muted-foreground">
          ML segmentation workspace — K-Means and hierarchical clustering across behavioral,
          psychographic, value, lifecycle, and occasion-based models.
        </p>
      </div>

      <div className="space-y-5 p-4 lg:p-8">
        <SectionCard
          title="Cluster intelligence"
          subtitle="K-MEANS & HIERARCHICAL CLUSTERING · WORKSPACE SUBSCRIBERS"
        >
          <ClusterSegmentationPanel workspaceId={workspaceId} />
        </SectionCard>

        <details className="rounded-lg border border-[#e8e0d4] bg-white shadow-sm dark:border-border dark:bg-card">
          <summary className="cursor-pointer px-5 py-4 font-serif text-lg font-medium">
            Atlas telemetry
            <span className="ml-2 text-[10px] font-normal uppercase tracking-widest text-[#8a7f72]">
              token economy & contract
            </span>
          </summary>
          <div className="space-y-5 border-t border-[#e8e0d4] p-5 dark:border-border">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {data.kpis.slice(0, 4).map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard title="Burn mix" subtitle="WHERE REDEMPTION VOLUME GOES" className="border-0 shadow-none p-0">
                <div className="flex h-10 w-full overflow-hidden rounded-md">
                  {data.burnMix.map((seg) => (
                    <div
                      key={seg.label}
                      className="flex items-center justify-center text-[10px] font-medium text-white"
                      style={{
                        width: `${seg.percent}%`,
                        backgroundColor: seg.color,
                        minWidth: seg.percent > 0 ? "2rem" : 0,
                      }}
                    >
                      {seg.percent >= 8 ? `${seg.percent}%` : ""}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Engagement" subtitle="PER-USER BEHAVIOUR" className="border-0 shadow-none p-0">
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {data.engagement.slice(0, 4).map((m) => (
                    <div key={m.label} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-[#5c5348] dark:text-muted-foreground">{m.label}</span>
                      <span className="font-mono font-medium tabular-nums">{m.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <p className="text-xs text-[#8a7f72] dark:text-muted-foreground">{data.apiNote}</p>
          </div>
        </details>
      </div>
    </div>
  );
}
