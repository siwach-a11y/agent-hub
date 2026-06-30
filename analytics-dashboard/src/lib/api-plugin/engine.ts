import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import { isBniiDataFeedWorkspace } from "@/lib/bnii/raw-data-countries";
import { computeNumericStats } from "@/lib/data-stats";
import { getPluginDefinition } from "./registry";
import {
  customerAnalyticsFeed,
  customerIntelligenceFeed,
  marketingAnalyticsFeed,
  resolveInternalFeedData,
  workspaceFeedMeta,
} from "./feed-builders";
import { resolveInternalRoute } from "./data-feeds";
import {
  BNII_METRICS_CATALOG_URL,
  BNII_METRICS_DICTIONARY_URL,
  catalogToTabularFeed,
  dictionaryToTabularFeed,
  loadBniiMetricsCatalog,
  loadBniiMetricsDictionary,
} from "./bnii-api";
import { normalizeJsonToRows, parseCsvToRows } from "./normalize";
import type { ApiPluginFetchRequest, ParsedApiPluginResult } from "./types";

function uid(): string {
  return `feed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildResult(
  partial: Omit<ParsedApiPluginResult, "numericStats" | "rowCount"> & {
    rows: Record<string, string | number>[];
  }
): ParsedApiPluginResult {
  const numericStats = computeNumericStats(partial.columns, partial.rows);
  const def = getPluginDefinition(partial.pluginId);
  return {
    ...partial,
    rowCount: partial.rows.length,
    numericStats,
    feedCategory: def?.category,
  };
}

export function fetchWorkspacePlugin(workspaceId: WorkspaceId = "u9"): ParsedApiPluginResult {
  const w = getWorkspace(workspaceId);
  const ws = w.workspace;
  const customer = getCustomerAnalytics(workspaceId);
  const marketing = getMarketingAnalytics(workspaceId);

  const columns = ["metric", "value"];
  const rows: Record<string, string | number>[] = [
    { metric: "Subscribers", value: ws.subscribers },
    { metric: "DAU", value: w.dau },
    { metric: "MAU", value: w.mau },
    { metric: "BNRY Earned (30d)", value: w.bnryEarned30d },
    { metric: "BNRY Burned (30d)", value: w.bnryRedeemed30d },
    { metric: "Earn / Burn", value: w.earnBurnRatio },
    { metric: "STW Winners (30d)", value: w.stwWinners30d },
    { metric: "Active subscribers", value: customer.activeCustomers },
    { metric: "Retention %", value: customer.retentionRate },
    { metric: "Engagement score", value: marketing.avgEngagementScore },
    { metric: "Events tracked (30d)", value: marketing.eventsTracked30d },
    { metric: "Active campaigns", value: marketing.activeCampaigns },
  ];

  return buildResult({
    connectionId: uid(),
    name: `${ws.code} · ${ws.country}`,
    pluginId: "workspace",
    fetchedAt: new Date().toISOString(),
    columns,
    rows,
    rawPreview: w.apiNote,
  });
}

export function fetchCustomerAnalyticsPlugin(
  workspaceId: WorkspaceId = "u9"
): ParsedApiPluginResult {
  const { code, country } = workspaceFeedMeta(workspaceId);
  const feed = customerAnalyticsFeed(workspaceId);
  return buildResult({
    connectionId: uid(),
    name: `Subscriber Analytics · ${code}`,
    pluginId: "customer-analytics",
    fetchedAt: new Date().toISOString(),
    columns: feed.columns,
    rows: feed.rows,
    rawPreview: `${feed.rawPreview} · ${country}`,
  });
}

export function fetchMarketingAnalyticsPlugin(
  workspaceId: WorkspaceId = "u9"
): ParsedApiPluginResult {
  const { code } = workspaceFeedMeta(workspaceId);
  const feed = marketingAnalyticsFeed(workspaceId);
  return buildResult({
    connectionId: uid(),
    name: `Engagement Feed · ${code}`,
    pluginId: "marketing-analytics",
    fetchedAt: new Date().toISOString(),
    columns: feed.columns,
    rows: feed.rows,
    rawPreview: feed.rawPreview,
  });
}

export function fetchCustomerIntelligencePlugin(
  workspaceId: WorkspaceId = "u9"
): ParsedApiPluginResult {
  const { code } = workspaceFeedMeta(workspaceId);
  const feed = customerIntelligenceFeed(workspaceId);
  return buildResult({
    connectionId: uid(),
    name: `Customer 360 Feed · ${code}`,
    pluginId: "customer-intelligence",
    fetchedAt: new Date().toISOString(),
    columns: feed.columns,
    rows: feed.rows,
    rawPreview: feed.rawPreview,
  });
}

export async function fetchBniiMetricsCatalogPlugin(): Promise<ParsedApiPluginResult> {
  const catalog = await loadBniiMetricsCatalog();
  const feed = catalogToTabularFeed(catalog);

  return buildResult({
    connectionId: uid(),
    name: "BNII Metrics Catalog",
    pluginId: "bnii-metrics-catalog",
    endpoint: BNII_METRICS_CATALOG_URL,
    fetchedAt: new Date().toISOString(),
    columns: feed.columns,
    rows: feed.rows,
    rawPreview: feed.rawPreview,
  });
}

export async function fetchBniiMetricsDictionaryPlugin(): Promise<ParsedApiPluginResult> {
  const dictionary = await loadBniiMetricsDictionary();
  const feed = dictionaryToTabularFeed(dictionary);

  return buildResult({
    connectionId: uid(),
    name: "BNII Metrics Dictionary",
    pluginId: "bnii-metrics-dictionary",
    endpoint: BNII_METRICS_DICTIONARY_URL,
    fetchedAt: new Date().toISOString(),
    columns: feed.columns,
    rows: feed.rows,
    rawPreview: feed.rawPreview,
  });
}

export async function fetchInternalApiPlugin(
  endpoint: string,
  workspaceId: WorkspaceId = "u9",
  name?: string
): Promise<ParsedApiPluginResult> {
  const routePath = resolveInternalRoute(endpoint);
  let data: unknown;

  if (typeof window !== "undefined") {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const qs = routePath.includes("?") ? "&" : "?";
    const url = `${base}${routePath}${qs}workspace=${workspaceId}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        data = await res.json();
      } else {
        data = await resolveInternalFeedData(routePath, workspaceId);
      }
    } catch {
      data = await resolveInternalFeedData(routePath, workspaceId);
    }
  } else {
    data = await resolveInternalFeedData(routePath, workspaceId);
  }

  const { columns, rows } = normalizeJsonToRows(data);
  if (rows.length === 0) {
    throw new Error("Internal API returned no tabular data.");
  }

  return buildResult({
    connectionId: uid(),
    name: name ?? `Internal · ${routePath}`,
    pluginId: "internal-api",
    endpoint: routePath,
    fetchedAt: new Date().toISOString(),
    columns,
    rows,
    rawPreview: JSON.stringify(data).slice(0, 400),
  });
}

export async function fetchRestJsonPlugin(
  endpoint: string,
  headers?: Record<string, string>,
  name?: string
): Promise<ParsedApiPluginResult> {
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status} for ${endpoint}`);
  }

  const data: unknown = await res.json();
  const { columns, rows } = normalizeJsonToRows(data);

  if (rows.length === 0) {
    throw new Error("No tabular data found in JSON response.");
  }

  return buildResult({
    connectionId: uid(),
    name: name ?? new URL(endpoint).hostname,
    pluginId: "rest-json",
    endpoint,
    fetchedAt: new Date().toISOString(),
    columns,
    rows,
    rawPreview: JSON.stringify(data).slice(0, 500),
  });
}

export async function fetchCsvUrlPlugin(
  endpoint: string,
  name?: string
): Promise<ParsedApiPluginResult> {
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`CSV URL returned ${res.status}`);
  }
  const text = await res.text();
  const { columns, rows } = parseCsvToRows(text);

  if (rows.length === 0) {
    throw new Error("No rows found in CSV.");
  }

  return buildResult({
    connectionId: uid(),
    name: name ?? "CSV import",
    pluginId: "csv-url",
    endpoint,
    fetchedAt: new Date().toISOString(),
    columns,
    rows,
    rawPreview: text.slice(0, 300),
  });
}

function assertBniiFeedWorkspace(workspaceId: WorkspaceId, feedName: string): void {
  if (!isBniiDataFeedWorkspace(workspaceId)) {
    throw new Error(
      `${feedName} is only available on BNII workspaces (U9, U5, U7, or U8).`
    );
  }
}

export async function runApiPlugin(request: ApiPluginFetchRequest): Promise<ParsedApiPluginResult> {
  const workspaceId = request.workspaceId ?? "u9";

  switch (request.pluginId) {
    case "workspace":
      return fetchWorkspacePlugin(workspaceId);
    case "customer-analytics":
      return fetchCustomerAnalyticsPlugin(workspaceId);
    case "marketing-analytics":
      return fetchMarketingAnalyticsPlugin(workspaceId);
    case "customer-intelligence":
      return fetchCustomerIntelligencePlugin(workspaceId);
    case "bnii-metrics-catalog":
      assertBniiFeedWorkspace(workspaceId, "BNII Metrics Catalog");
      return fetchBniiMetricsCatalogPlugin();
    case "bnii-metrics-dictionary":
      assertBniiFeedWorkspace(workspaceId, "BNII Metrics Dictionary");
      return fetchBniiMetricsDictionaryPlugin();
    case "internal-api":
      if (!request.endpoint?.trim()) {
        throw new Error("Internal API feed requires a route path (e.g. /api/customer-analytics).");
      }
      return fetchInternalApiPlugin(request.endpoint.trim(), workspaceId, request.name);
    case "rest-json":
      if (!request.endpoint?.trim()) {
        throw new Error("REST JSON feed requires an endpoint URL.");
      }
      return fetchRestJsonPlugin(
        request.endpoint.trim(),
        request.headers,
        request.name
      );
    case "csv-url":
      if (!request.endpoint?.trim()) {
        throw new Error("CSV URL feed requires an endpoint URL.");
      }
      return fetchCsvUrlPlugin(request.endpoint.trim(), request.name);
    default: {
      const _exhaustive: never = request.pluginId;
      throw new Error(`Unknown feed plugin: ${_exhaustive}`);
    }
  }
}
