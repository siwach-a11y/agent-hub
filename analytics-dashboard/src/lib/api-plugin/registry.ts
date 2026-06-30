import type { WorkspaceId } from "@/data/workspaces";
import { isBniiDataFeedWorkspace } from "@/lib/bnii/raw-data-countries";
import type { ApiPluginDefinition, ApiPluginId, DataFeedCategory } from "./types";

export const DATA_FEED_CATEGORIES: { id: DataFeedCategory; label: string }[] = [
  { id: "builtin", label: "Built-in analytics feeds" },
  { id: "bnii", label: "BNII Analytics API" },
  { id: "external", label: "External data feeds" },
];

export const API_PLUGIN_DEFINITIONS: ApiPluginDefinition[] = [
  {
    id: "workspace",
    name: "Workspace KPIs",
    description: "Live DAU, MAU, BNRY earn/burn, and campaign counts for the selected workspace.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Real-time · workspace scoped",
    docsHint: "Uses the country selector in the header.",
  },
  {
    id: "customer-analytics",
    name: "Subscriber Analytics Feed",
    description: "Lifecycle mix, segments, operators, and acquisition funnel metrics.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Synced with /customers",
  },
  {
    id: "marketing-analytics",
    name: "Engagement & Campaign Feed",
    description: "Campaign ROAS, engagement scores, event volumes, and behavioral segments.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Synced with /marketing",
  },
  {
    id: "customer-intelligence",
    name: "Customer 360 & RFM Feed",
    description: "RFM segments and segmentation KPIs as a tabular feed.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "RFM · Segmentation",
  },
  {
    id: "bnii-metrics-catalog",
    name: "BNII Metrics Catalog",
    description:
      "Core metrics allowlist and transaction type schema from the BNII Analytics API.",
    category: "bnii",
    requiresEndpoint: false,
    refreshHint: "BNII · /v1/metrics/catalog",
    docsHint: "https://bnii-analytics-api-epgxydm2fa-as.a.run.app/v1/metrics/catalog",
  },
  {
    id: "bnii-metrics-dictionary",
    name: "BNII Metrics Dictionary",
    description: "Metric and transaction type definitions from the BNII Analytics API.",
    category: "bnii",
    requiresEndpoint: false,
    refreshHint: "BNII · /v1/metrics/dictionary",
    docsHint: "https://bnii-analytics-api-epgxydm2fa-as.a.run.app/v1/metrics/dictionary",
  },
  {
    id: "internal-api",
    name: "Internal API Route",
    description: "Pull JSON from this app's analytics API routes (e.g. /api/customer-analytics).",
    category: "external",
    requiresEndpoint: true,
    endpointPlaceholder: "/api/customer-analytics",
    refreshHint: "Same-origin API",
    docsHint: "Path only or full URL. Works with all GET analytics routes.",
  },
  {
    id: "rest-json",
    name: "REST JSON Feed",
    description: "Connect any external GET JSON endpoint — arrays or { data: [...] } payloads.",
    category: "external",
    requiresEndpoint: true,
    endpointPlaceholder: "https://api.example.com/metrics",
    refreshHint: "External · poll on connect",
    docsHint: "Optional Bearer token below. Response must be JSON.",
  },
  {
    id: "csv-url",
    name: "CSV URL Feed",
    description: "Import comma-separated data from a public CSV URL.",
    category: "external",
    requiresEndpoint: true,
    endpointPlaceholder: "https://example.com/data.csv",
    refreshHint: "External · CSV",
    docsHint: "First row must be column headers.",
  },
];

export function getPluginDefinition(id: string): ApiPluginDefinition | undefined {
  return API_PLUGIN_DEFINITIONS.find((p) => p.id === id);
}

export function getFeedsByCategory(category: DataFeedCategory): ApiPluginDefinition[] {
  return API_PLUGIN_DEFINITIONS.filter((p) => p.category === category);
}

export function isBniiFeedPlugin(id: ApiPluginId): boolean {
  return getPluginDefinition(id)?.category === "bnii";
}

export function getVisibleFeedCategories(
  workspaceId: WorkspaceId
): { id: DataFeedCategory; label: string; feeds: ApiPluginDefinition[] }[] {
  const bniiAvailable = isBniiDataFeedWorkspace(workspaceId);

  return DATA_FEED_CATEGORIES.map((category) => ({
    ...category,
    feeds: getFeedsByCategory(category.id).filter((feed) => {
      if (feed.category === "bnii") {
        return bniiAvailable;
      }
      return true;
    }),
  })).filter((category) => category.feeds.length > 0);
}

export function getBuiltinFeedIds(): ApiPluginId[] {
  return API_PLUGIN_DEFINITIONS.filter((p) => p.category === "builtin").map((p) => p.id);
}
