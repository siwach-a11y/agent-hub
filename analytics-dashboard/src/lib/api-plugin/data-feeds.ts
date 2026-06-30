import type { ApiPluginDefinition, ApiPluginId, DataFeedCategory, ParsedApiPluginResult } from "./types";
import { DATA_FEED_CATEGORIES, API_PLUGIN_DEFINITIONS } from "./registry";

export type DataFeedCatalogEntry = ApiPluginDefinition & {
  categoryLabel: string;
};

export type DataFeedCatalog = {
  version: string;
  categories: typeof DATA_FEED_CATEGORIES;
  feeds: DataFeedCatalogEntry[];
  internalRoutes: string[];
};

/** Analytics API routes available as internal data feeds */
export const INTERNAL_FEED_ROUTES = [
  "/api/analytics/overview",
  "/api/customer-analytics",
  "/api/customer-intelligence",
  "/api/marketing-analytics",
  "/api/u9-analytics",
  "/api/behavior-campaign-analytics",
] as const;

export function getDataFeedCatalog(): DataFeedCatalog {
  const categoryLabels = Object.fromEntries(
    DATA_FEED_CATEGORIES.map((c) => [c.id, c.label])
  ) as Record<DataFeedCategory, string>;

  return {
    version: "2.0",
    categories: DATA_FEED_CATEGORIES,
    feeds: API_PLUGIN_DEFINITIONS.map((feed) => ({
      ...feed,
      categoryLabel: categoryLabels[feed.category],
    })),
    internalRoutes: [...INTERNAL_FEED_ROUTES],
  };
}

export function resolveInternalRoute(path: string): string {
  const trimmed = path.trim();
  if (trimmed.startsWith("http")) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function pluginBadgeLabel(pluginId: ApiPluginId): string {
  switch (pluginId) {
    case "workspace":
      return "Feed · Workspace";
    case "customer-analytics":
      return "Feed · Subscribers";
    case "marketing-analytics":
      return "Feed · Engagement";
    case "customer-intelligence":
      return "Feed · Customer 360";
    case "bnii-metrics-catalog":
      return "Feed · BNII Catalog";
    case "bnii-metrics-dictionary":
      return "Feed · BNII Dictionary";
    case "internal-api":
      return "Feed · Internal API";
    case "rest-json":
      return "Feed · REST JSON";
    case "csv-url":
      return "Feed · CSV";
    default: {
      const _exhaustive: never = pluginId;
      return _exhaustive;
    }
  }
}

export function defaultFeedName(pluginId: ApiPluginId, workspaceCode?: string): string {
  const def = API_PLUGIN_DEFINITIONS.find((p) => p.id === pluginId);
  const base = def?.name ?? pluginId;
  return workspaceCode ? `${base} · ${workspaceCode}` : base;
}

export type TabularFeed = Pick<ParsedApiPluginResult, "columns" | "rows" | "rawPreview">;
