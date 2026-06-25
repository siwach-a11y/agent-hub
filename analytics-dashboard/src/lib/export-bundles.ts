export type ExportBundleId =
  | "analytics-feature"
  | "api-plugin"
  | "customer-analytics"
  | "marketing-intelligence"
  | "all";

export type ExportBundle = {
  id: ExportBundleId;
  name: string;
  description: string;
  route: string | null;
  npmCommand: string;
  files: string[];
  zipPath: string;
};

export const EXPORT_BUNDLES: ExportBundle[] = [
  {
    id: "analytics-feature",
    name: "Analytics Functions",
    description: "lib/analytics.ts, lib/api.ts, and API routes",
    route: null,
    npmCommand: "npm run exports:copy:analytics",
    files: [
      "lib/analytics.ts",
      "lib/api.ts",
      "app/api/analytics/overview/route.ts",
      "app/api/u9-analytics/route.ts",
      "app/api/customer-analytics/route.ts",
      "app/api/marketing-analytics/route.ts",
    ],
    zipPath: "/exports/analytics-feature.zip",
  },
  {
    id: "api-plugin",
    name: "API Plugin",
    description: "REST/CSV connectors, plugin engine, visualize API data on Home",
    route: null,
    npmCommand: "npm run exports:copy:plugin",
    files: [
      "lib/api-plugin/*",
      "lib/data-stats.ts",
      "app/api/plugin/catalog/route.ts",
      "app/api/plugin/fetch/route.ts",
      "components/api-plugin/*",
      "components/providers/api-plugin-provider.tsx",
    ],
    zipPath: "/exports/api-plugin.zip",
  },
  {
    id: "customer-analytics",
    name: "Subscriber Analytics",
    description: "Lifecycle, cohorts, subscriber table, /customers page",
    route: "/customers",
    npmCommand: "npm run exports:copy:customer",
    files: [
      "types/customer-analytics.ts",
      "data/customer-analytics.ts",
      "data/customers.json",
      "app/customers/page.tsx",
      "components/analytics/*",
    ],
    zipPath: "/exports/customer-analytics.zip",
  },
  {
    id: "marketing-intelligence",
    name: "Engagement Intelligence",
    description: "Campaigns, behavior tracking, /marketing page",
    route: "/marketing",
    npmCommand: "npm run exports:copy:marketing",
    files: [
      "types/marketing-intelligence.ts",
      "data/marketing-analytics.ts",
      "app/marketing/page.tsx",
      "components/marketing/*",
    ],
    zipPath: "/exports/marketing-intelligence.zip",
  },
  {
    id: "all",
    name: "Full Analytics Stack",
    description: "All bundles merged into your-project/src",
    route: null,
    npmCommand: "npm run exports:copy:all",
    files: ["customer-analytics + marketing-intelligence + analytics-feature + api-plugin"],
    zipPath: "/exports/analytics-all.zip",
  },
];

export const ADD_GUIDE_MARKDOWN = `# Analytics Feature — ADD Guide

Copy bundles into your Next.js project from the agenthub repo.

## Upload data (dashboard UI)

Open **Add Files → Upload data** in the sidebar to analyze:

- **Pictures** (JPEG, PNG, GIF, WebP) — preview + image metadata
- **PDF** — text extraction, tabular detection, page stats
- **Excel** (.xlsx, .xls) and **CSV** — column stats, preview table
- **Google Sheets** — paste a share link (public / link-shared sheets)

Parsed metrics (row counts, numeric averages/sums) appear in the upload panel.

## Quick copy (from agenthub root)

\`\`\`bash
npm run exports:copy:analytics    # functions + API routes
npm run exports:copy:customer     # subscriber analytics UI
npm run exports:copy:marketing    # engagement intelligence UI
npm run exports:copy:all          # everything
\`\`\`

Custom target:

\`\`\`bash
EXPORT_TARGET=your-project/src npm run exports:copy:analytics
\`\`\`

## Server usage

\`\`\`ts
import { analytics, getAnalyticsOverview } from "@/lib/analytics";

const overview = getAnalyticsOverview();
const subscribers = analytics.subscribers();
\`\`\`

## Client usage

\`\`\`ts
import { analyticsApi } from "@/lib/api";

const overview = await analyticsApi.overview();
\`\`\`

## API routes

| Route | Returns |
|-------|---------|
| GET /api/analytics/overview | Combined customer + marketing + U9 |
| GET /api/customer-analytics | Subscriber analytics |
| GET /api/marketing-analytics | Engagement / campaigns |
| GET /api/u9-analytics | U9 workspace dashboard |

See exports/analytics-feature/README.md in the repo for full details.
`;

export function getExportBundle(id: ExportBundleId): ExportBundle | undefined {
  return EXPORT_BUNDLES.find((b) => b.id === id);
}

export function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
