"use client";

import { useMemo } from "react";
import { AppLink } from "@/components/app-link";
import { Header } from "@/components/layout/header";
import { CustomerAnalyticsKpi } from "@/components/analytics/customer-analytics-kpi";
import { RfmAnalysisPanel } from "@/components/analytics/rfm-analysis-panel";
import { TelcoSegmentationPanel } from "@/components/bnii/telco-segmentation-panel";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getCustomerIntelligence } from "@/data/customer-intelligence";

export default function CustomersPage() {
  const { workspaceId, workspace } = useWorkspace();
  const data = useMemo(() => getCustomerAnalytics(workspaceId), [workspaceId]);
  const intelligence = useMemo(() => getCustomerIntelligence(workspaceId), [workspaceId]);

  const ws = workspace.workspace;

  return (
    <>
      <Header
        title="Subscriber Analytics"
        subtitle={`${ws.name} ${ws.country} · RFM clustering & segmentation models`}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-end">
          <AppLink href="/marketing" className="text-xs text-primary hover:underline">
            Engagement Intelligence →
          </AppLink>
        </div>

        <CustomerAnalyticsKpi
          totalCustomers={data.totalCustomers}
          activeCustomers={data.activeCustomers}
          atRiskCustomers={data.atRiskCustomers}
          newCustomersThisMonth={data.newCustomersThisMonth}
          retentionRate={data.retentionRate}
          churnRate={data.churnRate}
          avgLtv={data.avgLtv}
          npsScore={data.npsScore}
          totalCustomerChange={data.totalCustomerChange}
          retentionChange={data.retentionChange}
          npsChange={data.npsChange}
        />

        <Tabs defaultValue="rfm">
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="rfm">RFM Clustering</TabsTrigger>
            <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          </TabsList>

          <TabsContent value="rfm" className="mt-4">
            <RfmAnalysisPanel data={intelligence.rfm} />
          </TabsContent>

          <TabsContent value="segmentation" className="mt-4">
            <TelcoSegmentationPanel workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
