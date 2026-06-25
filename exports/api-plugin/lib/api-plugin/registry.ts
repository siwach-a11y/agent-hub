import type { ApiPluginDefinition } from "./types";

export const API_PLUGIN_DEFINITIONS: ApiPluginDefinition[] = [
  {
    id: "workspace",
    name: "BNII Workspace",
    description: "Live workspace KPIs from the selected country (DAU, MAU, BNRY, campaigns).",
    requiresEndpoint: false,
    docsHint: "Uses the workspace selected in the country dropdown.",
  },
  {
    id: "rest-json",
    name: "REST JSON API",
    description: "Fetch JSON from any GET endpoint and visualize arrays or object fields.",
    requiresEndpoint: true,
    endpointPlaceholder: "https://api.example.com/metrics",
    docsHint: "Response should be a JSON array or { data: [...] }.",
  },
  {
    id: "csv-url",
    name: "CSV URL",
    description: "Pull comma-separated data from a public CSV URL.",
    requiresEndpoint: true,
    endpointPlaceholder: "https://example.com/data.csv",
    docsHint: "First row must be column headers.",
  },
];

export function getPluginDefinition(id: string): ApiPluginDefinition | undefined {
  return API_PLUGIN_DEFINITIONS.find((p) => p.id === id);
}
