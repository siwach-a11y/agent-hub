import type { NumericColumnStat } from "@/types/upload-analytics";
import type { WorkspaceId } from "@/data/workspaces";

export type ApiPluginId = "workspace" | "rest-json" | "csv-url";

export type ApiPluginDefinition = {
  id: ApiPluginId;
  name: string;
  description: string;
  requiresEndpoint: boolean;
  endpointPlaceholder?: string;
  docsHint?: string;
};

export type ApiPluginConnection = {
  id: string;
  pluginId: ApiPluginId;
  name: string;
  endpoint?: string;
  workspaceId?: WorkspaceId;
  headers?: Record<string, string>;
  createdAt: string;
};

export type ApiPluginResult = {
  connectionId: string;
  name: string;
  pluginId: ApiPluginId;
  endpoint?: string;
  fetchedAt: string;
  columns: string[];
  rows: Record<string, string | number>[];
  numericStats: NumericColumnStat[];
  rowCount: number;
  rawPreview?: string;
};

export type ApiPluginFetchRequest = {
  pluginId: ApiPluginId;
  name?: string;
  endpoint?: string;
  workspaceId?: WorkspaceId;
  headers?: Record<string, string>;
};
