import type { NumericColumnStat } from "@/types/upload-analytics";
import type { TranslatedAnalytics } from "@/types/upload-analytics";
import type { WorkspaceId } from "@/data/workspaces";

export type ApiPluginId =
  | "workspace"
  | "customer-analytics"
  | "marketing-analytics"
  | "customer-intelligence"
  | "bnii-metrics-catalog"
  | "bnii-metrics-dictionary"
  | "internal-api"
  | "rest-json"
  | "csv-url";

export type DataFeedCategory = "builtin" | "bnii" | "external";

export type ApiPluginDefinition = {
  id: ApiPluginId;
  name: string;
  description: string;
  category: DataFeedCategory;
  requiresEndpoint: boolean;
  endpointPlaceholder?: string;
  docsHint?: string;
  refreshHint?: string;
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

export type ParsedApiPluginResult = {
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
  feedCategory?: DataFeedCategory;
};

export type ApiPluginResult = ParsedApiPluginResult & {
  analytics: TranslatedAnalytics;
};

export type ApiPluginFetchRequest = {
  pluginId: ApiPluginId;
  name?: string;
  endpoint?: string;
  workspaceId?: WorkspaceId;
  headers?: Record<string, string>;
};
