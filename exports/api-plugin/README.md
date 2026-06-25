# API Plugin — ADD Guide

Plug-in module to connect external APIs and visualize JSON/CSV data in the analytics dashboard.

## What this adds

| Path | Purpose |
|------|---------|
| `lib/api-plugin/` | Plugin engine, registry, JSON/CSV normalizers |
| `lib/data-stats.ts` | Numeric column stats for charts |
| `lib/api.ts` | `apiPluginApi.fetch()`, `apiPluginApi.catalog()` |
| `app/api/plugin/catalog/route.ts` | `GET /api/plugin/catalog` |
| `app/api/plugin/fetch/route.ts` | `POST /api/plugin/fetch` |
| `components/api-plugin/` | UI: connect panel, dashboard charts, header button |

## Built-in plugins

| ID | Description |
|----|-------------|
| `workspace` | BNII workspace KPIs (DAU, MAU, BNRY, campaigns) |
| `rest-json` | Any GET JSON endpoint (array or `{ data: [...] }`) |
| `csv-url` | Public CSV URL |

## Quick copy

```bash
# From agenthub root
npm run exports:copy:plugin

# Custom target
EXPORT_TARGET=your-project/src npm run exports:copy:plugin
```

## Server usage

```ts
import { runApiPlugin } from "@/lib/api-plugin";

const result = await runApiPlugin({
  pluginId: "rest-json",
  endpoint: "https://api.example.com/metrics",
  name: "My API",
});
```

## Client usage

```ts
import { apiPluginApi } from "@/lib/api";

const catalog = await apiPluginApi.catalog();
const data = await apiPluginApi.fetch({
  pluginId: "workspace",
  workspaceId: "u9",
});
```

## API routes

| Route | Method | Body / response |
|-------|--------|-----------------|
| `/api/plugin/catalog` | GET | `{ plugins, version }` |
| `/api/plugin/fetch` | POST | `{ pluginId, endpoint?, workspaceId?, name? }` → chart-ready rows |

## UI

Wrap your app with `ApiPluginProvider`, add `ApiPluginButton` to the header, and `ApiPluginDashboard` on Home.

Requires `WorkspaceProvider` for the workspace plugin and country selector.

## Prerequisites

- `analytics-feature` bundle (or full `analytics-dashboard` data layer)
- Recharts + shadcn UI components (from analytics-dashboard)
