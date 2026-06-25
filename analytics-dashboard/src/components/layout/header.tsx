"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/sidebar";
import { AddFilesButton } from "@/components/export/add-files-button";
import { DataUploadButtons } from "@/components/analytics/data-upload-buttons";
import { ApiPluginButton } from "@/components/api-plugin/api-plugin-button";
import { CountrySelect } from "@/components/layout/country-select";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/formatters";
import { Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string | false;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [now, setNow] = useState<string | null>(null);
  const { workspace } = useWorkspace();
  const ws = workspace.workspace;
  const workspaceSubtitle = `${ws.code} · ${formatNumber(ws.subscribers, true)} subscribers · ${ws.tier}`;

  useEffect(() => {
    const tick = () => {
      setNow(
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(new Date())
      );
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <div>
            <h1 className="text-base font-bold tracking-tight lg:text-lg">{title}</h1>
            {subtitle !== false && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                {subtitle ?? workspaceSubtitle}
              </p>
            )}
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-2 md:flex">
          <CountrySelect />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block md:flex-none">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers, campaigns..."
              className="h-8 w-52 pl-8 text-xs lg:w-64"
            />
          </div>

          <span className="hidden min-w-[140px] font-mono text-[10px] text-muted-foreground xl:block">
            {now ?? "\u00A0"}
          </span>

          <CountrySelect className="md:hidden" />

          <DataUploadButtons size="sm" className="hidden sm:flex" />
          <ApiPluginButton className="hidden sm:flex" />

          <AddFilesButton className="lg:hidden" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
