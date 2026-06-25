"use client";

import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ApiPluginPanel } from "@/components/api-plugin/api-plugin-panel";
import { cn } from "@/lib/utils";

export function ApiPluginButton({
  className,
  variant = "header",
  onConnected,
}: {
  className?: string;
  variant?: "header" | "inline";
  onConnected?: () => void;
}) {
  function scrollToViz() {
    document.getElementById("api-plugin-dashboard")?.scrollIntoView({ behavior: "smooth" });
    onConnected?.();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {variant === "inline" ? (
          <Button type="button" variant="outline" className={cn("gap-2", className)}>
            <Plug className="h-4 w-4" />
            API Plugin
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs", className)}
          >
            <Plug className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API Plugin</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-primary" />
            API Plugin
          </SheetTitle>
          <SheetDescription>
            Connect REST JSON, CSV URLs, or built-in workspace KPIs — charts appear on Home.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto pr-1">
          <ApiPluginPanel onConnected={scrollToViz} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
