"use client";

import { useState } from "react";
import { Loader2, Plug, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiPlugin } from "@/components/providers/api-plugin-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { apiPluginApi } from "@/lib/api";
import { API_PLUGIN_DEFINITIONS } from "@/lib/api-plugin/registry";
import type { ApiPluginId } from "@/lib/api-plugin";

type ApiPluginPanelProps = {
  onConnected?: () => void;
  compact?: boolean;
};

export function ApiPluginPanel({ onConnected, compact }: ApiPluginPanelProps) {
  const { workspaceId } = useWorkspace();
  const { addResult, results, clearResults } = useApiPlugin();
  const [pluginId, setPluginId] = useState<ApiPluginId>("workspace");
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const definition = API_PLUGIN_DEFINITIONS.find((p) => p.id === pluginId);

  async function handleConnect() {
    setError(null);
    setLoading(true);
    try {
      const result = await apiPluginApi.fetch({
        pluginId,
        name: name.trim() || undefined,
        endpoint: endpoint.trim() || undefined,
        workspaceId,
      });
      addResult(result);
      onConnected?.();
      if (pluginId !== "workspace") {
        setEndpoint("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Plugin type
          </label>
          <Select value={pluginId} onValueChange={(v) => setPluginId(v as ApiPluginId)}>
            <SelectTrigger className="mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {API_PLUGIN_DEFINITIONS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {definition && (
            <p className="mt-1 text-[10px] text-muted-foreground">{definition.description}</p>
          )}
        </div>

        {!compact && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Display name (optional)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My metrics API"
              className="mt-1 h-8 text-xs"
            />
          </div>
        )}

        {definition?.requiresEndpoint && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Endpoint URL
            </label>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder={definition.endpointPlaceholder}
              className="mt-1 h-8 text-xs font-mono"
            />
            {definition.docsHint && (
              <p className="mt-1 text-[10px] text-muted-foreground">{definition.docsHint}</p>
            )}
          </div>
        )}

        <Button
          type="button"
          className="w-full gap-2"
          size={compact ? "sm" : "default"}
          disabled={loading}
          onClick={handleConnect}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plug className="h-4 w-4" />
          )}
          Connect & visualize
        </Button>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">{results.length} source(s) connected</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[10px]"
              onClick={clearResults}
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
