import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import { computeNumericStats } from "@/lib/data-stats";
import { normalizeJsonToRows, parseCsvToRows } from "./normalize";
import type { ApiPluginFetchRequest, ApiPluginResult } from "./types";

function uid(): string {
  return `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildResult(
  partial: Omit<ApiPluginResult, "numericStats" | "rowCount"> & {
    rows: Record<string, string | number>[];
  }
): ApiPluginResult {
  const numericStats = computeNumericStats(partial.columns, partial.rows);
  return {
    ...partial,
    rowCount: partial.rows.length,
    numericStats,
  };
}

export function fetchWorkspacePlugin(workspaceId: WorkspaceId = "u9"): ApiPluginResult {
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

export async function fetchRestJsonPlugin(
  endpoint: string,
  headers?: Record<string, string>,
  name?: string
): Promise<ApiPluginResult> {
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
): Promise<ApiPluginResult> {
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

export async function runApiPlugin(request: ApiPluginFetchRequest): Promise<ApiPluginResult> {
  switch (request.pluginId) {
    case "workspace":
      return fetchWorkspacePlugin(request.workspaceId ?? "u9");
    case "rest-json":
      if (!request.endpoint?.trim()) {
        throw new Error("REST JSON plugin requires an endpoint URL.");
      }
      return fetchRestJsonPlugin(
        request.endpoint.trim(),
        request.headers,
        request.name
      );
    case "csv-url":
      if (!request.endpoint?.trim()) {
        throw new Error("CSV URL plugin requires an endpoint URL.");
      }
      return fetchCsvUrlPlugin(request.endpoint.trim(), request.name);
    default:
      throw new Error(`Unknown plugin: ${request.pluginId}`);
  }
}
