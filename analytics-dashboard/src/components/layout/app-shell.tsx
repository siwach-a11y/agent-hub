"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ApiPluginProvider } from "@/components/providers/api-plugin-provider";
import { UploadAnalyticsProvider } from "@/components/providers/upload-analytics-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <UploadAnalyticsProvider>
        <ApiPluginProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </ApiPluginProvider>
      </UploadAnalyticsProvider>
    </WorkspaceProvider>
  );
}
